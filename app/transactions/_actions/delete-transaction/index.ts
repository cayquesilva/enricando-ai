"use server";

import { db } from "@/app/_lib/prisma";
import { requireAuth } from "@/app/_lib/auth";
import { ERROR_MESSAGES } from "@/app/_lib/constants";
import { revalidatePath } from "next/cache";
import { endOfMonth, isSameMonth } from "date-fns";
import { z } from "zod";

// 1. Definimos um schema para validar os parâmetros de entrada
const deleteTransactionSchema = z.object({
  transactionId: z.string().uuid("ID da transação inválido."),
  month: z.string(),
  year: z.string(),
});

// 2. A função agora recebe um único objeto 'params' para facilitar a validação
export const deleteTransaction = async (params: {
  transactionId: string;
  month: string;
  year: string;
}) => {
  // Validação dos dados usando o schema
  const { transactionId, month, year } = deleteTransactionSchema.parse(params);

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

  // Se a transação for recorrente...
  if (transaction.isRecurring) {
    const referenceDate = new Date(parseInt(year), parseInt(month) - 1, 1);

    // 3. Melhoria: Se o utilizador apagar a recorrência no seu primeiro mês,
    // a transação é removida por completo, em vez de apenas ser "terminada".
    if (isSameMonth(transaction.date, referenceDate)) {
      await db.transaction.delete({
        where: { id: transactionId },
      });
    } else {
      // Se for um mês subsequente, definimos a data de fim para o último dia do mês anterior.
      const previousMonth = new Date(
        referenceDate.setMonth(referenceDate.getMonth() - 1),
      );
      const newEndDate = endOfMonth(previousMonth);

      await db.transaction.update({
        where: { id: transactionId },
        data: { endDate: newEndDate },
      });
    }
  } else {
    // Se não for recorrente, simplesmente apagamos.
    await db.transaction.delete({
      where: { id: transactionId },
    });
  }

  revalidatePath("/transactions");
  revalidatePath("/");
};
