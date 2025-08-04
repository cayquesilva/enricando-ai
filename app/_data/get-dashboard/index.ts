import { db } from "@/app/_lib/prisma";
import { TransactionType } from "@prisma/client";
import { TotalExpensePerCategory, TransactionpercentagePerType } from "./types";
import { requireAuth } from "@/app/_lib/auth";
import { dateParamSchema } from "@/app/_lib/validations";
import {
  addMonths,
  startOfMonth,
  endOfMonth,
} from "date-fns";

export const getDashboard = async (month: string, year: string) => {
  // Validação dos parâmetros
  const { month: validMonth, year: validYear } = dateParamSchema.parse({ month, year });
  
  // Autenticação
  const userId = await requireAuth();

  const referenceDate = new Date(`${validYear}-${validMonth}-01`);

  const currentMonthStart = startOfMonth(referenceDate);
  const currentMonthEnd = endOfMonth(referenceDate);

  // Condição base para filtrar transações
  const where = {
    userId,
    date: {
      gte: currentMonthStart,
      lte: currentMonthEnd,
    },
  };

  // Calcular totais por tipo de transação
  const depositsTotal = Number(
    (
      await db.transaction.aggregate({
        where: { ...where, type: "DEPOSIT" },
        _sum: { amount: true },
      })
    )?._sum?.amount || 0,
  );
  
  const investmentsTotal = Number(
    (
      await db.transaction.aggregate({
        where: { ...where, type: "INVESTMENT" },
        _sum: { amount: true },
      })
    )?._sum?.amount || 0,
  );

  // Calcular despesas considerando parcelas
  const expenses = await db.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
    },
  });

  // Filtrar despesas considerando parcelas
  const filteredExpenses = expenses.filter((expense) => {
    if (expense.installments && expense.installments > 1) {
      for (let i = 0; i < expense.installments; i++) {
        const installmentMonth = addMonths(expense.date, i);
        if (
          installmentMonth >= currentMonthStart &&
          installmentMonth <= currentMonthEnd
        ) {
          return true;
        }
      }
    } else {
      return (
        expense.date >= currentMonthStart && expense.date <= currentMonthEnd
      );
    }
    return false;
  });

  // Calcular total de despesas
  const nonParcelledExpenses = filteredExpenses.filter(
    (transaction) => !transaction.installments || transaction.installments <= 1,
  );

  const distributedExpenses = filteredExpenses
    .filter((transaction) => transaction.installments > 1)
    .flatMap((transaction) => {
      const installmentAmount =
        Number(transaction.amount) / transaction.installments;

      return Array.from({ length: transaction.installments }, (_, index) => {
        const installmentDate = addMonths(transaction.date, index);
        const isInstallmentInReferenceMonth =
          installmentDate.getFullYear() === referenceDate.getFullYear() &&
          installmentDate.getMonth() === referenceDate.getMonth();

        return isInstallmentInReferenceMonth
          ? { date: installmentDate, amount: installmentAmount }
          : null;
      }).filter((installment) => installment !== null);
    });

  let expensesTotal = distributedExpenses.reduce(
    (total, installment) => total + installment.amount,
    0,
  );

  nonParcelledExpenses.forEach((transaction) => {
    expensesTotal += Number(transaction.amount);
  });

  // Calcular saldo
  const balance = depositsTotal - investmentsTotal - expensesTotal;

  // Buscar todas as transações para cálculo de percentuais
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      OR: [
        {
          date: {
            gte: currentMonthStart,
            lte: currentMonthEnd,
          },
        },
        { installments: { gte: 1 } },
      ],
    },
  });

  // Calcular total considerando parcelas
  const transactionsTotal = transactions.reduce((total, transaction) => {
    if (transaction.installments && transaction.installments > 1) {
      const installmentAmount =
        Number(transaction.amount) / transaction.installments;

      for (let i = 0; i < transaction.installments; i++) {
        const installmentMonth = addMonths(transaction.date, i);
        if (installmentMonth > currentMonthEnd) {
          break;
        }
        if (
          installmentMonth >= currentMonthStart &&
          installmentMonth <= currentMonthEnd
        ) {
          total += installmentAmount;
        }
      }
    } else {
      if (
        transaction.date >= currentMonthStart &&
        transaction.date <= currentMonthEnd
      ) {
        total += Number(transaction.amount);
      }
    }

    return total;
  }, 0);

  // Calcular percentuais por tipo
  const typesPercentage: TransactionpercentagePerType = {
    [TransactionType.DEPOSIT]: Math.round(
      transactionsTotal > 0 ? (Number(depositsTotal) / Number(transactionsTotal)) * 100 : 0,
    ),
    [TransactionType.EXPENSE]: Math.round(
      transactionsTotal > 0 ? (Number(expensesTotal) / Number(transactionsTotal)) * 100 : 0,
    ),
    [TransactionType.INVESTMENT]: Math.round(
      transactionsTotal > 0 ? (Number(investmentsTotal) / Number(transactionsTotal)) * 100 : 0,
    ),
  };

  // Calcular despesas por categoria
  const expensesCategory = await db.transaction.findMany({
    where: {
      userId,
      type: TransactionType.EXPENSE,
      OR: [
        {
          date: {
            gte: currentMonthStart,
            lte: currentMonthEnd,
          },
        },
        { installments: { gte: 1 } },
      ],
    },
    select: {
      category: true,
      amount: true,
      installments: true,
      date: true,
    },
  });

  const totalExpensePerCategory: TotalExpensePerCategory[] = [];

  expensesCategory.forEach((expense) => {
    const existingCategory = totalExpensePerCategory.find(
      (category) => category.category === expense.category,
    );
    
    const adjustedAmount = Number(expense.amount) / (expense.installments || 1);

    if (expense.installments && expense.installments > 1) {
      for (let i = 0; i < expense.installments; i++) {
        const installmentMonth = addMonths(expense.date, i);
        if (installmentMonth > currentMonthEnd) {
          break;
        }
        if (
          installmentMonth >= currentMonthStart &&
          installmentMonth <= currentMonthEnd
        ) {
          if (existingCategory) {
            existingCategory.totalAmount += adjustedAmount;
          } else {
            totalExpensePerCategory.push({
              category: expense.category,
              totalAmount: adjustedAmount,
              percentageOfTotal: 0,
            });
          }
        }
      }
    } else {
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
            percentageOfTotal: 0,
          });
        }
      }
    }
  });

  // Calcular percentuais por categoria
  totalExpensePerCategory.forEach((category) => {
    category.percentageOfTotal = Math.round(
      expensesTotal > 0 ? (category.totalAmount / expensesTotal) * 100 : 0,
    );
  });

  // Buscar últimas transações
  const lastTransactions = await db.transaction.findMany({
    where: {
      userId,
    },
    orderBy: { date: "desc" },
    take: 15,
  });

  return {
    balance,
    depositsTotal,
    investmentsTotal,
    expensesTotal,
    typesPercentage,
    totalExpensePerCategory,
    lastTransactions: JSON.parse(JSON.stringify(lastTransactions)),
  };
};
