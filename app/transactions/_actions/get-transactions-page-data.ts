"use server";

import { db } from "../../_lib/prisma";
import { requireAuth } from "../../_lib/auth";
import { canUserAddTransaction } from "../../_data/can-user-add-transaction";
import { addMonths, isMatch } from "date-fns"; // Adicione 'addMonths'

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

  // 1. Buscamos todas as transações que começaram ANTES do FIM do mês selecionado.
  const potentialTransactions = await db.transaction.findMany({
    where: {
      userId: user.id,
      date: {
        lte: endDate,
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  // 2. Filtramos em código para encontrar apenas as transações com parcelas ativas no mês.
  const transactionsInMonth = potentialTransactions.filter((transaction) => {
    for (let i = 0; i < transaction.installments; i++) {
      const installmentDate = addMonths(transaction.date, i);
      // Se qualquer uma das parcelas cair dentro do intervalo do mês, incluímos a transação.
      if (installmentDate >= startDate && installmentDate <= endDate) {
        return true;
      }
    }
    return false;
  });

  const userCanAddTransaction = await canUserAddTransaction(
    user.id,
    user.isPremium,
    month,
    year,
  );

  const safeUser = JSON.parse(JSON.stringify(user));
  // Retornamos a lista já filtrada corretamente.
  const safeTransactions = JSON.parse(JSON.stringify(transactionsInMonth));

  return {
    user: safeUser,
    transactions: safeTransactions,
    userCanAddTransaction,
  };
};
