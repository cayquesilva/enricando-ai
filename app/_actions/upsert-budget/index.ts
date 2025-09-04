"use server";

import { z } from "zod";
import { requireAuth } from "../../_lib/auth";
import { db } from "../../_lib/prisma";
import { revalidatePath } from "next/cache";
import { TransactionCategory } from "@prisma/client";

const upsertBudgetSchema = z.object({
  category: z.nativeEnum(TransactionCategory),
  amount: z.number().min(0, "O valor deve ser positivo."),
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
});

export const upsertBudget = async (
  params: z.infer<typeof upsertBudgetSchema>,
) => {
  const user = await requireAuth();
  const { category, amount, month, year } = upsertBudgetSchema.parse(params);

  await db.budget.upsert({
    where: {
      userId_category_month_year: {
        userId: user.id,
        category,
        month,
        year,
      },
    },
    update: { amount },
    create: {
      userId: user.id,
      category,
      amount,
      month,
      year,
    },
  });

  revalidatePath("/budgets");
  revalidatePath("/"); // Para atualizar o dashboard no futuro
};
