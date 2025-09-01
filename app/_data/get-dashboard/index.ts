import { db } from "@/app/_lib/prisma";
import { TransactionType } from "@prisma/client";
import { TotalExpensePerCategory, TransactionpercentagePerType } from "./types";
import { dateParamSchema } from "@/app/_lib/validations";
import { addMonths } from "date-fns";
import { AuthUser } from "../../_lib/auth";

export const getDashboard = async (
  month: string,
  year: string,
  user: AuthUser,
) => {
  const { month: validMonth, year: validYear } = dateParamSchema.parse({
    month,
    year,
  });

  // --- INÍCIO DA CORREÇÃO DE DATA ---
  // Cria as datas de início e fim do mês de forma segura,
  // evitando problemas de fuso horário.
  // O mês no construtor do Date é 0-indexed (janeiro = 0), então subtraímos 1.
  const yearNum = parseInt(validYear);
  const monthIndex = parseInt(validMonth) - 1;

  const startDate = new Date(yearNum, monthIndex, 1);
  // Para obter o fim do mês, vamos para o início do próximo mês e subtraímos 1 milissegundo.
  const endDate = new Date(yearNum, monthIndex + 1, 1);
  endDate.setMilliseconds(endDate.getMilliseconds() - 1);
  // 1. Buscamos todas as transações que começaram ANTES do FIM do mês selecionado.
  const potentialTransactions = await db.transaction.findMany({
    where: {
      userId: user.id,
      date: { lte: endDate },
    },
  });

  let depositsTotal = 0;
  let investmentsTotal = 0;
  let expensesTotal = 0;
  const totalExpensePerCategory: TotalExpensePerCategory[] = [];

  // 2. Iteramos sobre as transações para calcular os totais das parcelas do mês.
  potentialTransactions.forEach((transaction) => {
    const installmentAmount =
      Number(transaction.amount) / transaction.installments;

    for (let i = 0; i < transaction.installments; i++) {
      const installmentDate = addMonths(transaction.date, i);

      // Se a parcela atual cair dentro do mês de referência...
      if (installmentDate >= startDate && installmentDate <= endDate) {
        // ...processamos o valor dela...
        switch (transaction.type) {
          case TransactionType.DEPOSIT:
            depositsTotal += installmentAmount;
            break;
          case TransactionType.INVESTMENT:
            investmentsTotal += installmentAmount;
            break;
          case TransactionType.EXPENSE:
            expensesTotal += installmentAmount;
            const existingCategory = totalExpensePerCategory.find(
              (c) => c.category === transaction.category,
            );
            if (existingCategory) {
              existingCategory.totalAmount += installmentAmount;
            } else {
              totalExpensePerCategory.push({
                category: transaction.category,
                totalAmount: installmentAmount,
                percentageOfTotal: 0,
              });
            }
            break;
        }
        // ...e saímos do loop, pois só queremos contar uma parcela por mês por transação.
        break;
      }
    }
  });

  const balance = depositsTotal - investmentsTotal - expensesTotal;
  const transactionsTotal = depositsTotal + investmentsTotal + expensesTotal;

  const typesPercentage: TransactionpercentagePerType = {
    DEPOSIT: Math.round(
      transactionsTotal > 0 ? (depositsTotal / transactionsTotal) * 100 : 0,
    ),
    EXPENSE: Math.round(
      transactionsTotal > 0 ? (expensesTotal / transactionsTotal) * 100 : 0,
    ),
    INVESTMENT: Math.round(
      transactionsTotal > 0 ? (investmentsTotal / transactionsTotal) * 100 : 0,
    ),
  };

  totalExpensePerCategory.forEach((category) => {
    category.percentageOfTotal = Math.round(
      expensesTotal > 0 ? (category.totalAmount / expensesTotal) * 100 : 0,
    );
  });

  const lastTransactions = await db.transaction.findMany({
    where: { userId: user.id },
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
    user: JSON.parse(JSON.stringify(user)),
  };
};
