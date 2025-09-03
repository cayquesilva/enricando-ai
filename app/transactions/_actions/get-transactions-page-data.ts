"use server";

import { db } from "../../_lib/prisma";
import { requireAuth } from "../../_lib/auth";
import { canUserAddTransaction } from "../../_data/can-user-add-transaction";
import { addMonths, isMatch } from "date-fns";
import {
  Prisma,
  Transaction,
  TransactionCategory,
  TransactionType,
} from "@prisma/client";

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

  const where: Prisma.TransactionWhereInput = {
    userId: user.id,
    date: { lte: endDate },
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

    if (transaction.isRecurring) {
      if (transaction.type === TransactionType.DEPOSIT) {
        totalIncome += installmentAmount;
      } else if (transaction.type === TransactionType.EXPENSE) {
        totalExpenses += installmentAmount;
      }
      return true;
    } else {
      for (let i = 0; i < transaction.installments; i++) {
        const installmentDate = addMonths(transaction.date, i);
        if (installmentDate >= startDate && installmentDate <= endDate) {
          if (transaction.type === TransactionType.DEPOSIT) {
            totalIncome += installmentAmount;
          } else if (transaction.type === TransactionType.EXPENSE) {
            totalExpenses += installmentAmount;
          }
          return true;
        }
      }
    }
    return false;
  });

  // --- INÍCIO DA LÓGICA DO SEPARADOR ---
  const finalTransactions: (Transaction & { isSeparator?: boolean })[] = [];
  let separatorInserted = false;

  transactionsInMonth.forEach((transaction) => {
    const transactionStartedInPreviousMonth = transaction.date < startDate;

    // Se a transação começou num mês anterior E o separador ainda não foi inserido...
    if (transactionStartedInPreviousMonth && !separatorInserted) {
      // ...insere o nosso objeto separador especial na lista.
      finalTransactions.push({
        id: "separator",
        isSeparator: true,
        // Preenchemos o resto com dados falsos para satisfazer o tipo de dados.
        name: "separator",
        type: TransactionType.EXPENSE,
        amount: new Prisma.Decimal(0),
        category: "OTHER",
        paymentMethod: "OTHER",
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        installments: 0,
        isRecurring: false,
        endDate: null,
        userId: user.id,
      });
      separatorInserted = true; // Marcamos que o separador já foi inserido.
    }
    // Adicionamos a transação real à lista final.
    finalTransactions.push(transaction);
  });
  // --- FIM DA LÓGICA DO SEPARADOR ---

  const userCanAddTransaction = await canUserAddTransaction(
    user.id,
    user.isPremium,
    month,
    year,
  );

  const safeUser = JSON.parse(JSON.stringify(user));
  // Convertemos 'amount' para número e depois serializamos a lista final
  const transactionsWithNumberAmount = finalTransactions.map((t) => ({
    ...t,
    amount: t.amount.toNumber(),
  }));
  const safeTransactions = JSON.parse(
    JSON.stringify(transactionsWithNumberAmount),
  );

  return {
    user: safeUser,
    transactions: safeTransactions,
    userCanAddTransaction,
    totalIncome,
    totalExpenses,
  };
};
