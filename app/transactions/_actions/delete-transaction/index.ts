"use server";

import { db } from "@/app/_lib/prisma";
import { requireAuth } from "@/app/_lib/auth";
import { deleteTransactionSchema } from "@/app/_lib/validations";
import { ERROR_MESSAGES } from "@/app/_lib/constants";
import { revalidatePath } from "next/cache";

export const deleteTransaction = async (params: { transactionId: string }) => {
  // Validação dos dados
  const { transactionId } = deleteTransactionSchema.parse(params);
  
  // Autenticação
  const user = await requireAuth();
  
  // Verificar se a transação existe e pertence ao usuário
  const transaction = await db.transaction.findFirst({
    where: {
      id: transactionId,
      userId: user.id,
    },
  });
  
  if (!transaction) {
    throw new Error(ERROR_MESSAGES.TRANSACTION_NOT_FOUND);
  }

  await db.transaction.delete({
    where: {
      id: transactionId,
      userId: user.id, // Segurança adicional
    },
  });

  revalidatePath("/transactions");
  revalidatePath("/");
};
