"use server";

import { db } from "../../_lib/prisma";
import { requireAuth } from "../../_lib/auth";
import { canUserAddTransaction } from "../../_data/can-user-add-transaction";
import { addMonths, isMatch } from "date-fns";
import { Prisma, TransactionType, TransactionCategory } from "@prisma/client";

interface GetTransactionsDataProps {
  month: string;
  year: string;
  search?: string;
  category?: string;
}

export const getTransactionsPageData = async ({
  month,
  year,
  search,
  category,
}: GetTransactionsDataProps) => {
  const user = await requireAuth();

  if (!isMatch(month, "MM") || !isMatch(year, "yyyy")) {
    throw new Error("Data inválida.");
  }

  const yearNum = parseInt(year);
  const monthIndex = parseInt(month) - 1;
  const startDate = new Date(yearNum, monthIndex, 1);
  const endDate = new Date(yearNum, monthIndex + 1, 1);
  endDate.setMilliseconds(endDate.getMilliseconds() - 1);

  // A query do Prisma agora é mais inteligente para apanhar transações recorrentes
  const where: Prisma.TransactionWhereInput = {
    userId: user.id,
    date: { lte: endDate }, // A transação deve ter começado ANTES do FIM do mês
    // E deve terminar DEPOIS do INÍCIO do mês (se tiver uma data de fim)
    OR: [{ endDate: { gte: startDate } }, { endDate: null }],
    AND: [
      search ? { name: { contains: search, mode: "insensitive" } } : {},
      category ? { category: { equals: category as TransactionCategory } } : {},
    ],
  };

  const potentialTransactions = await db.transaction.findMany({
    where,
    orderBy: { date: "desc" },
  });

  let totalIncome = 0;
  let totalExpenses = 0;

  const transactionsInMonth = potentialTransactions.filter((transaction) => {
    const installmentAmount =
      Number(transaction.amount) / transaction.installments;

    // --- LÓGICA DE FILTRO CORRIGIDA ---
    if (transaction.isRecurring) {
      // Se for recorrente, simplesmente verificamos se o período é válido.
      // A query do Prisma já fez a maior parte do trabalho.
      if (transaction.type === TransactionType.DEPOSIT) {
        totalIncome += installmentAmount;
      } else if (transaction.type === TransactionType.EXPENSE) {
        totalExpenses += installmentAmount;
      }
      return true; // Inclui a transação na lista
    } else {
      // Se não for recorrente, usamos a lógica de parcelas
      for (let i = 0; i < transaction.installments; i++) {
        const installmentDate = addMonths(transaction.date, i);
        if (installmentDate >= startDate && installmentDate <= endDate) {
          if (transaction.type === TransactionType.DEPOSIT) {
            totalIncome += installmentAmount;
          } else if (transaction.type === TransactionType.EXPENSE) {
            totalExpenses += installmentAmount;
          }
          return true; // Inclui a transação na lista
        }
      }
    }
    return false; // Exclui se nenhuma condição for satisfeita
  });

  const userCanAddTransaction = await canUserAddTransaction(
    user.id,
    user.isPremium,
    month,
    year,
  );

  const safeUser = JSON.parse(JSON.stringify(user));
  const safeTransactions = JSON.parse(JSON.stringify(transactionsInMonth));

  return {
    user: safeUser,
    transactions: safeTransactions,
    userCanAddTransaction,
    totalIncome,
    totalExpenses,
  };
};
