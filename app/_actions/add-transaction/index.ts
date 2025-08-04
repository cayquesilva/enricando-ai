"use server";

import { db } from "@/app/_lib/prisma";
import { requireAuth } from "@/app/_lib/auth";
import { transactionSchema } from "@/app/_lib/validations";
import { ERROR_MESSAGES } from "@/app/_lib/constants";
import { revalidatePath } from "next/cache";
import { canUserAddTransaction } from "@/app/_data/can-user-add-transaction";

type UpsertTransactionParams = {
  id?: string;
  name: string;
  amount: number;
  type: "DEPOSIT" | "EXPENSE" | "INVESTMENT";
  category: string;
  paymentMethod: string;
  date: Date;
  installments: number;
};

export const upsertTransaction = async (params: UpsertTransactionParams) => {
  // Validação dos dados
  const validatedData = transactionSchema.parse(params);
  
  // Autenticação
  const userId = await requireAuth();
  
  // Verificar se pode adicionar transação (apenas para novas transações)
  if (!params.id) {
    const canAdd = await canUserAddTransaction();
    if (!canAdd) {
      throw new Error(ERROR_MESSAGES.TRANSACTION_LIMIT_REACHED);
    }
  }

  // Verificar se a transação existe e pertence ao usuário (para updates)
  if (params.id) {
    const existingTransaction = await db.transaction.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });
    
    if (!existingTransaction) {
      throw new Error(ERROR_MESSAGES.TRANSACTION_NOT_FOUND);
    }
  }

  await db.transaction.upsert({
    update: { ...validatedData, userId },
    create: { ...validatedData, userId },
    where: {
      id: params.id ?? "",
    },
  });

  revalidatePath("/transactions");
  revalidatePath("/");
};
