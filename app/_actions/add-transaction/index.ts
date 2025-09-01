"use server";

import { db } from "@/app/_lib/prisma";
import { requireAuth } from "@/app/_lib/auth";
import { transactionSchema } from "@/app/_lib/validations";
import { ERROR_MESSAGES } from "@/app/_lib/constants";
import { revalidatePath } from "next/cache";
import { canUserAddTransaction } from "@/app/_data/can-user-add-transaction";
import { addMonths, getMonth, getYear } from "date-fns";

type UpsertTransactionParams = {
  id?: string;
  name: string;
  amount: number;
  type: "DEPOSIT" | "EXPENSE" | "INVESTMENT";
  category: string;
  paymentMethod: string;
  date: Date;
  installments: number;
  isRecurring: boolean; // Novo campo
};

export const upsertTransaction = async (params: UpsertTransactionParams) => {
  // Validação dos dados
  const validatedData = transactionSchema.parse(params);

  // Autenticação
  const user = await requireAuth();

  // Verificar se pode adicionar transação (apenas para novas transações)
  if (!params.id) {
    const month = String(getMonth(validatedData.date) + 1).padStart(2, "0");
    const year = String(getYear(validatedData.date));
    const canAdd = await canUserAddTransaction(
      user.id,
      user.isPremium,
      month,
      year,
    );
    if (!canAdd) {
      throw new Error(ERROR_MESSAGES.TRANSACTION_LIMIT_REACHED);
    }
  }

  // Se for recorrente, defina uma data de fim muito no futuro
  // Se não, a data de fim é baseada nas parcelas
  const endDate = params.isRecurring
    ? new Date("2999-12-31") // Uma data simbólica para "infinito"
    : addMonths(validatedData.date, validatedData.installments - 1);

  // Verificar se a transação existe e pertence ao usuário (para updates)
  if (params.id) {
    const existingTransaction = await db.transaction.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingTransaction) {
      throw new Error(ERROR_MESSAGES.TRANSACTION_NOT_FOUND);
    }
  }

  await db.transaction.upsert({
    update: { ...validatedData, userId: user.id, endDate },
    create: { ...validatedData, userId: user.id, endDate },
    where: {
      id: params.id ?? "",
    },
  });

  revalidatePath("/transactions");
  revalidatePath("/");
};
