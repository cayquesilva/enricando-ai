import { db } from "@/app/_lib/prisma";
import { TransactionType } from "@prisma/client";
import { TotalExpensePerCategory, TransactionpercentagePerType } from "./types";
import { auth } from "@clerk/nextjs/server";
import { addMonths, subDays, startOfMonth, subMonths } from "date-fns";

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

  const expenses = await db.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      OR: Array.from({ length: 12 }, (_, i) => ({
        // Para cada mês, verificamos se ele está dentro do intervalo de parcelas
        date: {
          gte: subDays(addMonths(referenceDate, -i), 1), // Mês anterior até o atual
          lt: subDays(addMonths(referenceDate, 1), 1), // Próximo mês
        },
      })),
    },
  });

  // Mapear parcelas individuais para cada transação
  const distributedExpenses = expenses.flatMap((transaction) => {
    const installmentAmount =
      Number(transaction.amount) / (transaction.installments || 1); // Divide o valor pelo número de parcelas
    return Array.from({ length: transaction.installments }, (_, index) => ({
      date: subMonths(addMonths(transaction.date, index), 1),
      amount: installmentAmount,
    }));
  });

  // Filtrar apenas as parcelas que pertencem ao mês de referência
  const filteredDistributedExpenses = distributedExpenses.filter(
    (installment) =>
      installment.date.getFullYear() === referenceDate.getFullYear() &&
      installment.date.getMonth() === referenceDate.getMonth(),
  );

  // Somar as despesas do mês
  const expensesTotal = filteredDistributedExpenses.reduce(
    (total, installment) => total + installment.amount,
    0,
  );

  //salvando o saldo
  const balance = depositsTotal - investmentsTotal - expensesTotal;

  //busca a soma de todas as transações do mês e do usuario logado
  const transactions = await db.transaction.findMany({
    where,
  });

  const transactionsTotal = transactions.reduce((total, transaction) => {
    const installmentAmount =
      Number(transaction.amount) / (transaction.installments || 1); // Divide pelo número de parcelas, assumindo 1 se não houver parcelas
    return total + installmentAmount;
  }, 0);

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

  const expensesCategory = await db.transaction.findMany({
    where: {
      ...where,
      type: TransactionType.EXPENSE,
    },
    select: {
      category: true,
      amount: true,
      installments: true,
    },
  });

  const totalExpensePerCategory: TotalExpensePerCategory[] = [];

  // Agrupa as transações por categoria e ajusta o valor considerando as parcelas
  expensesCategory.forEach((expense) => {
    const existingCategory = totalExpensePerCategory.find(
      (category) => category.category === expense.category,
    );

    // Ajuste: divide o valor da transação pelo número de parcelas
    const adjustedAmount = Number(expense.amount) / (expense.installments || 1);

    if (existingCategory) {
      existingCategory.totalAmount += adjustedAmount;
    } else {
      totalExpensePerCategory.push({
        category: expense.category,
        totalAmount: adjustedAmount,
        percentageOfTotal: 0, // Inicializamos com 0, a porcentagem será calculada depois
      });
    }
  });

  // Agora calcule a porcentagem de cada categoria
  totalExpensePerCategory.forEach((category) => {
    category.percentageOfTotal = Math.round(
      (category.totalAmount / expensesTotal) * 100,
    );
  });

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
    return (
      transaction.date <= subDays(startOfMonth(maxValidDate), 1) &&
      subDays(startOfMonth(maxValidDate), 1) >=
        subDays(addMonths(referenceDate, 1), 1) &&
      transaction.date <= subDays(addMonths(referenceDate, 1), 1)
    );
  });

  //console.log("Transações filtradas:", filteredTransactions);

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
