import { db } from "@/app/_lib/prisma";
import { TransactionType } from "@prisma/client";
import { TotalExpensePerCategory, TransactionpercentagePerType } from "./types";
import { auth } from "@clerk/nextjs/server";
import { addMonths, subDays, startOfMonth } from "date-fns";

export const getDashboard = async (month: string) => {
  //segurança de autenticação
  const { userId } = await auth();

  const referenceDate = new Date(`2024-${month}-01`);

  if (!userId) {
    throw new Error("Não autorizado.");
  }

  //define uma condição where, pare ser adicionada abaixo, garantindo que o mês receba todos os dias dele 01 a 31
  const where = {
    userId,
    date: {
      gte: new Date(`2024-${month}-01`),
      lt: new Date(`2024-${month}-31`),
    },
  };

  //db.transaction.aggregate onde o tipo é X somando a coluna amount. (busca em banco e soma automatica)
  const depositsTotal = Number(
    (
      await db.transaction.aggregate({
        where: { ...where, type: "DEPOSIT" },
        _sum: { amount: true },
      })
    )?._sum?.amount,
  );
  const investmentsTotal = Number(
    (
      await db.transaction.aggregate({
        where: { ...where, type: "INVESTMENT" },
        _sum: { amount: true },
      })
    )?._sum?.amount,
  );
  const expensesTotal = Number(
    (
      await db.transaction.aggregate({
        where: { ...where, type: "EXPENSE" },
        _sum: { amount: true },
      })
    )?._sum?.amount,
  );

  //salvando o saldo
  const balance = depositsTotal - investmentsTotal - expensesTotal;

  //busca a soma de todas as transações do mês e do usuario logado
  const transactionsTotal = Number(
    (
      await db.transaction.aggregate({
        where,
        _sum: { amount: true },
      })
    )._sum.amount,
  );

  const typesPercentage: TransactionpercentagePerType = {
    [TransactionType.DEPOSIT]: Math.round(
      (Number(depositsTotal || 0) / Number(transactionsTotal)) * 100,
    ),
    [TransactionType.EXPENSE]: Math.round(
      (Number(expensesTotal || 0) / Number(transactionsTotal)) * 100,
    ),
    [TransactionType.INVESTMENT]: Math.round(
      (Number(investmentsTotal || 0) / Number(transactionsTotal)) * 100,
    ),
  };

  const totalExpensePerCategory: TotalExpensePerCategory[] =
    //groupby junta as categorias e soma cada uma de forma separada
    //depois da map em cada categoria para pegar a porcentagem
    (
      await db.transaction.groupBy({
        by: ["category"],
        where: {
          ...where,
          type: TransactionType.EXPENSE,
        },
        _sum: {
          amount: true,
        },
      })
    ).map((category) => ({
      category: category.category,
      totalAmount: Number(category._sum.amount),
      percentageOfTotal: Math.round(
        (Number(category._sum.amount) / Number(expensesTotal)) * 100,
      ),
    }));

  //busca as ultimas 15 transações do mês
  const lastTransactions = await db.transaction.findMany({
    where: {
      userId,
    },
    orderBy: { date: "desc" },
    take: 15,
  });

  //console.log("lastTransactions:", lastTransactions); // Log para verificar o resultado da consulta

  const filteredTransactions = lastTransactions.filter((transaction) => {
    // Calcula a data limite com base no número de installments
    const maxValidDate = addMonths(transaction.date, transaction.installments);
    console.log("data da transação: ", transaction.date);
    console.log("data limite do mes: ", subDays(startOfMonth(maxValidDate), 1));
    console.log(
      "fim do mes selecionado: ",
      subDays(addMonths(referenceDate, 1), 1),
    );
    return (
      transaction.date <= subDays(startOfMonth(maxValidDate), 1) &&
      subDays(startOfMonth(maxValidDate), 1) >=
        subDays(addMonths(referenceDate, 1), 1) &&
      transaction.date <= subDays(addMonths(referenceDate, 1), 1)
    );
  });

  console.log("Transações filtradas:", filteredTransactions);

  return {
    balance,
    depositsTotal,
    investmentsTotal,
    expensesTotal,
    typesPercentage,
    totalExpensePerCategory,
    lastTransactions: JSON.parse(JSON.stringify(filteredTransactions)),
  };
};
