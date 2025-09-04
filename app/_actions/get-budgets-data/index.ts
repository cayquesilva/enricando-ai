"use server";

import { requireAuth } from "../../_lib/auth";
import { db } from "../../_lib/prisma";
import { TRANSACTION_CATEGORY_OPTIONS } from "../../_constants/transactions";
import { TransactionType } from "@prisma/client";
import { endOfMonth, addMonths } from "date-fns";

export const getBudgetsData = async ({
  month,
  year,
}: {
  month: number;
  year: number;
}) => {
  const user = await requireAuth();

  const startDate = new Date(year, month - 1, 1);
  const endDate = endOfMonth(startDate);

  // 1. Busca os orçamentos definidos pelo utilizador para o mês
  const budgets = await db.budget.findMany({
    where: { userId: user.id, month, year },
  });

  // 2. Busca todas as despesas que podem ser relevantes para o mês
  const potentialExpenses = await db.transaction.findMany({
    where: {
      userId: user.id,
      type: TransactionType.EXPENSE,
      date: { lte: endDate },
      OR: [{ endDate: { gte: startDate } }, { endDate: null }],
    },
  });

  // 3. Calcula o gasto real para cada categoria
  const spendingByCategory = new Map<string, number>();

  potentialExpenses.forEach((expense) => {
    const installmentAmount = Number(expense.amount) / expense.installments;
    const loopDuration = expense.isRecurring ? 120 : expense.installments;

    for (let i = 0; i < loopDuration; i++) {
      const installmentDate = addMonths(expense.date, i);
      if (expense.endDate && installmentDate > expense.endDate) break;
      if (installmentDate >= startDate && installmentDate <= endDate) {
        const currentSpending = spendingByCategory.get(expense.category) || 0;
        spendingByCategory.set(
          expense.category,
          currentSpending + installmentAmount,
        );
        break;
      }
    }
  });

  // 4. Junta tudo num único array para a UI
  const budgetData = TRANSACTION_CATEGORY_OPTIONS.map((categoryOption) => {
    const budget = budgets.find((b) => b.category === categoryOption.value);
    const spent = spendingByCategory.get(categoryOption.value) || 0;

    return {
      category: categoryOption.value,
      categoryLabel: categoryOption.label,
      budgetAmount: budget ? Number(budget.amount) : 0,
      spentAmount: spent,
      remainingAmount: budget ? Number(budget.amount) - spent : 0,
    };
  });

  return JSON.parse(JSON.stringify(budgetData));
};
