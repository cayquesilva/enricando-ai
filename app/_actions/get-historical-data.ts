"use server";

import { requireAuth } from "../_lib/auth";
import { db } from "../_lib/prisma";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  addMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { TransactionType } from "@prisma/client";

export const getHistoricalData = async () => {
  const user = await requireAuth();

  const today = new Date();
  // Define o início do nosso período de 12 meses (ex: 1º de Out, 2024)
  const twelveMonthsAgo = startOfMonth(subMonths(today, 11));

  // Busca todas as transações que possam estar ativas nos últimos 12 meses
  const potentialTransactions = await db.transaction.findMany({
    where: {
      userId: user.id,
      date: { lte: endOfMonth(today) }, // Que começaram antes do fim do mês atual
      OR: [
        { endDate: { gte: twelveMonthsAgo } }, // E que terminam depois do início do nosso período
        { endDate: null }, // Ou que não têm data de fim (dados antigos)
      ],
    },
  });

  // Prepara um array com os 12 meses que queremos no gráfico
  const months = Array.from({ length: 12 })
    .map((_, i) => {
      const date = subMonths(today, i);
      return {
        name: format(date, "MMM", { locale: ptBR }), // Ex: "set", "out", "nov"
        startDate: startOfMonth(date),
        endDate: endOfMonth(date),
        income: 0,
        expenses: 0,
      };
    })
    .reverse(); // Inverte para ter do mais antigo ao mais recente

  // Processa cada transação e distribui o seu valor pelos meses correspondentes
  potentialTransactions.forEach((transaction) => {
    const installmentAmount =
      Number(transaction.amount) /
      (transaction.isRecurring ? 1 : transaction.installments);

    const loopDuration = transaction.isRecurring
      ? 120
      : transaction.installments; // Limite de 10 anos para recorrências

    for (let i = 0; i < loopDuration; i++) {
      const installmentDate = addMonths(transaction.date, i);

      if (installmentDate > endOfMonth(today)) break; // Pára se a parcela for no futuro
      if (transaction.endDate && installmentDate > transaction.endDate) break; // Pára se a recorrência terminou

      // Encontra o mês correspondente à data da parcela
      const targetMonth = months.find(
        (m) => installmentDate >= m.startDate && installmentDate <= m.endDate,
      );
      if (targetMonth) {
        if (transaction.type === TransactionType.DEPOSIT) {
          targetMonth.income += installmentAmount;
        } else if (transaction.type === TransactionType.EXPENSE) {
          targetMonth.expenses += installmentAmount;
        }
      }
    }
  });

  // Retorna apenas os dados necessários para o gráfico
  return months.map(({ name, income, expenses }) => ({
    month: name,
    income,
    expenses,
  }));
};
