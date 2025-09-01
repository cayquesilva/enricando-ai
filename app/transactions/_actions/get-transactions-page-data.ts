"use server";

import { db } from "../../_lib/prisma";
import { requireAuth } from "../../_lib/auth";
import { canUserAddTransaction } from "../../_data/can-user-add-transaction";
import { addMonths, isMatch } from "date-fns";
import {
  Prisma,
  TransactionType,
  TransactionCategory,
  Transaction,
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

  // --- INÍCIO DA ALTERAÇÃO ---

  // O tipo da nossa lista final agora pode incluir o objeto separador.
  const finalTransactions: (Transaction & { isSeparator?: boolean })[] = [];
  let separatorInserted = false;

  potentialTransactions.forEach((transaction) => {
    let hasInstallmentInMonth = false;
    const installmentAmount =
      Number(transaction.amount) / transaction.installments;

    for (let i = 0; i < transaction.installments; i++) {
      const installmentDate = addMonths(transaction.date, i);
      if (installmentDate >= startDate && installmentDate <= endDate) {
        hasInstallmentInMonth = true;
        if (transaction.type === TransactionType.DEPOSIT) {
          totalIncome += installmentAmount;
        } else if (transaction.type === TransactionType.EXPENSE) {
          totalExpenses += installmentAmount;
        }
        break;
      }
    }

    // Apenas processe as transações que têm parcelas no mês selecionado.
    if (hasInstallmentInMonth) {
      const transactionStartedInPreviousMonth = transaction.date < startDate;

      // Se a transação começou num mês anterior E o separador ainda não foi inserido...
      if (transactionStartedInPreviousMonth && !separatorInserted) {
        // ...insere o nosso objeto separador especial na lista.
        finalTransactions.push({
          id: "separator", // ID único para o separador
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
          userId: user.id,
        });
        separatorInserted = true; // Marcamos que o separador já foi inserido.
      }
      // Adicionamos a transação real à lista final.
      finalTransactions.push(transaction);
    }
  });
  // --- FIM DA ALTERAÇÃO ---

  const userCanAddTransaction = await canUserAddTransaction(
    user.id,
    user.isPremium,
    month,
    year,
  );

  const safeUser = JSON.parse(JSON.stringify(user));
  // Retornamos a nova lista que contém as transações e o separador.
  const safeTransactions = JSON.parse(JSON.stringify(finalTransactions));

  return {
    user: safeUser,
    transactions: safeTransactions,
    userCanAddTransaction,
    totalIncome,
    totalExpenses,
  };
};
