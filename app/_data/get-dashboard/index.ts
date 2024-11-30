import { db } from "@/app/_lib/prisma";
import { TransactionType } from "@prisma/client";
import { TotalExpensePerCategory, TransactionpercentagePerType } from "./types";
import { auth } from "@clerk/nextjs/server";
import {
  addMonths,
  subDays,
  startOfMonth,
  endOfMonth,
  isAfter,
} from "date-fns";

export const getDashboard = async (month: string, year: string) => {
  //segurança de autenticação
  const { userId } = await auth();

  const referenceDate = new Date(`${year}-${month}-01`);

  // Defina o intervalo para o mês atual
  //remover addmonths e subdays para usar em produção
  const currentMonthStart = startOfMonth(referenceDate);
  const currentMonthEnd = endOfMonth(referenceDate);

  //console.log("inicio do mes: ", currentMonthStart);
  //console.log("fim do mes: ", currentMonthEnd);

  if (!userId) {
    throw new Error("Não autorizado.");
  }

  //define uma condição where, pare ser adicionada abaixo, garantindo que o mês receba todos os dias dele 01 a 31
  const where = {
    userId,
    date: {
      gte: currentMonthStart, // Transações do mês atual
      lte: currentMonthEnd,
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

  // Recuperar transações do banco de dados
  const expenses = await db.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      AND: [
        {
          installments: {
            gte: 1, // Somente transações parceladas ou com pelo menos 1 parcela
          },
        },
      ],
    },
  });

  // Filtra as transações para considerar aquelas com parcelas a vencer ou transações do mês de referência
  const filteredExpenses = expenses.filter((expense) => {
    if (expense.installments && expense.installments > 1) {
      // Verificar parcelas de transações parceladas
      for (let i = 0; i < expense.installments; i++) {
        const installmentMonth = addMonths(expense.date, i); // Data da parcela
        if (
          installmentMonth >= currentMonthStart &&
          installmentMonth <= currentMonthEnd
        ) {
          return true; // Pelo menos uma parcela no mês de referência
        }
      }
    } else if (expense.installments === 1 || !expense.installments) {
      // Transações não parceladas ou com 1 parcela
      return (
        expense.date >= currentMonthStart && expense.date <= currentMonthEnd
      );
    }
    return false;
  });

  //console.log("transações filtradas: ", filteredExpenses);

  // Separar transações parceladas e não parceladas
  const nonParcelledExpenses = filteredExpenses.filter(
    (transaction) => !transaction.installments || transaction.installments <= 1,
  );

  const distributedExpenses = filteredExpenses
    .filter((transaction) => transaction.installments > 1) // Somente transações parceladas
    .flatMap((transaction) => {
      const installmentAmount =
        Number(transaction.amount) / transaction.installments; // Valor por parcela

      return Array.from({ length: transaction.installments }, (_, index) => {
        const installmentDate = addMonths(transaction.date, index); // Data da parcela
        const isInstallmentInReferenceMonth =
          installmentDate.getFullYear() === referenceDate.getFullYear() &&
          installmentDate.getMonth() === referenceDate.getMonth();

        return isInstallmentInReferenceMonth
          ? { date: installmentDate, amount: installmentAmount }
          : null; // Ignorar parcelas de outros meses
      }).filter((installment) => installment !== null); // Remover parcelas nulas
    });

  // Somar valores das parcelas no mês de referência
  let expensesTotal = distributedExpenses.reduce(
    (total, installment) => total + installment.amount,
    0,
  );

  // Somar valores das transações não parceladas
  nonParcelledExpenses.forEach((transaction) => {
    expensesTotal += Number(transaction.amount);
  });

  //console.log("Total de despesas no mês de referência:", expensesTotal);

  //salvando o saldo
  const balance = depositsTotal - investmentsTotal - expensesTotal;

  // Busque todas as transações (podemos filtrar inicialmente por tipo ou data, dependendo do banco)
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      OR: [
        {
          date: {
            gte: currentMonthStart, // Transações do mês atual
            lte: currentMonthEnd,
          },
        },
        { installments: { gte: 1 } }, // Transações parceladas
      ],
    },
  });

  // Calcule o total, considerando parcelas a vencer
  const transactionsTotal = transactions.reduce((total, transaction) => {
    if (transaction.installments && transaction.installments > 1) {
      // Valor de cada parcela
      const installmentAmount =
        Number(transaction.amount) / transaction.installments;

      // Verifique cada parcela individualmente
      for (let i = 0; i < transaction.installments; i++) {
        const installmentMonth = addMonths(transaction.date, i); // Data da parcela
        if (installmentMonth > currentMonthEnd) {
          break; // Ignora parcelas após o mês atual
        }
        if (
          installmentMonth >= currentMonthStart &&
          installmentMonth <= currentMonthEnd
        ) {
          total += installmentAmount; // Adicione parcela dentro do mês atual
        }
      }
    } else {
      // Transações não parceladas
      if (
        transaction.date >= currentMonthStart &&
        transaction.date <= currentMonthEnd
      ) {
        total += Number(transaction.amount); // Soma o valor total
      }
    }

    return total;
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
      userId,
      type: TransactionType.EXPENSE,
      OR: [
        {
          date: {
            gte: currentMonthStart, // Transações do mês atual
            lte: currentMonthEnd,
          },
        },
        { installments: { gte: 1 } }, // Transações parceladas
      ],
    },
    select: {
      category: true,
      amount: true,
      installments: true,
      date: true, // Necessário para calcular as parcelas futuras
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

    // Se for uma transação parcelada, precisamos verificar quais parcelas estão a vencer
    if (expense.installments && expense.installments > 1) {
      for (let i = 0; i < expense.installments; i++) {
        const installmentMonth = addMonths(expense.date, i); // Calcula o mês da parcela
        if (isAfter(installmentMonth, currentMonthEnd)) {
          break; // Parcela futura, não relevante
        }
        if (
          installmentMonth >= currentMonthStart &&
          installmentMonth <= currentMonthEnd
        ) {
          // Se a parcela é do mês atual, adiciona o valor ajustado
          if (existingCategory) {
            existingCategory.totalAmount += adjustedAmount;
          } else {
            totalExpensePerCategory.push({
              category: expense.category,
              totalAmount: adjustedAmount,
              percentageOfTotal: 0, // Inicializamos com 0, a porcentagem será calculada depois
            });
          }
        }
      }
    } else {
      // Transações não parceladas: basta adicionar o valor completo
      if (
        expense.date >= currentMonthStart &&
        expense.date <= currentMonthEnd
      ) {
        if (existingCategory) {
          existingCategory.totalAmount += adjustedAmount;
        } else {
          totalExpensePerCategory.push({
            category: expense.category,
            totalAmount: adjustedAmount,
            percentageOfTotal: 0, // Inicializamos com 0, a porcentagem será calculada depois
          });
        }
      }
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
    take: 20,
  });

  //console.log("transações sem filtro:", lastTransactions); // Log para verificar o resultado da consulta

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
