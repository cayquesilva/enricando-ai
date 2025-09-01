"use server";

import { db } from "../../_lib/prisma";
import { requireAuth } from "../../_lib/auth";
import { canUserAddTransaction } from "../../_data/can-user-add-transaction";
import { isMatch } from "date-fns";

// Esta função busca todos os dados necessários para a página de transações.
export const getTransactionsPageData = async ({
  month,
  year,
}: {
  month: string;
  year: string;
}) => {
  const user = await requireAuth();

  // Validação de segurança dos parâmetros de data
  if (!isMatch(month, "MM") || !isMatch(year, "yyyy")) {
    throw new Error("Data inválida.");
  }

  const yearNum = parseInt(year);
  const monthIndex = parseInt(month) - 1;
  const startDate = new Date(yearNum, monthIndex, 1);
  const endDate = new Date(yearNum, monthIndex + 1, 1);
  endDate.setMilliseconds(endDate.getMilliseconds() - 1);

  // Busca as transações filtradas pelo período
  const transactions = await db.transaction.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  // Verifica a permissão para adicionar transação no período
  const userCanAddTransaction = await canUserAddTransaction(
    user.id,
    user.isPremium,
    month,
    year,
  );

  // Serializa (limpa) os dados antes de os enviar para o cliente
  const safeUser = JSON.parse(JSON.stringify(user));
  const safeTransactions = JSON.parse(JSON.stringify(transactions));

  return {
    user: safeUser,
    transactions: safeTransactions,
    userCanAddTransaction,
  };
};
