"use server";

import { z } from "zod";
import { requireAuth } from "../../_lib/auth";
import { db } from "../../_lib/prisma";
import { revalidatePath } from "next/cache";
import {
  TransactionCategory,
  TransactionPaymentMethod,
  TransactionType,
} from "@prisma/client";
import { canUserAddTransaction } from "../../_data/can-user-add-transaction";
import { ERROR_MESSAGES } from "../../_lib/constants";
import { addMonths, endOfDay } from "date-fns";

// Schema para validar uma única transação da lista
const transactionSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  amount: z.number().positive("O valor deve ser positivo."),
  date: z.date(),
  category: z.nativeEnum(TransactionCategory, {
    errorMap: () => ({ message: "Selecione uma categoria." }),
  }),
  currentInstallment: z.number().optional(),
  totalInstallments: z.number().optional(),
});

// A action agora espera um array de transações
const schema = z.array(transactionSchema);

export const saveExtractedTransactions = async (transactions: unknown) => {
  const user = await requireAuth();

  const validatedTransactions = schema.safeParse(transactions);
  if (!validatedTransactions.success) {
    throw new Error("Dados das transações inválidos.");
  }

  // Verificar o limite de transações
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const year = String(new Date().getFullYear());
  const canAdd = await canUserAddTransaction(
    user.id,
    user.isPremium,
    month,
    year,
    validatedTransactions.data.length,
  );
  if (!canAdd) {
    throw new Error(ERROR_MESSAGES.TRANSACTION_LIMIT_REACHED);
  }

  // Prepara os dados para serem inseridos no banco de dados
  const dataToCreate = validatedTransactions.data.map((t) => {
    const isParcelled = t.totalInstallments && t.totalInstallments > 1;

    // Calcula a data de início da compra (importante para parcelas)
    const startDate = isParcelled
      ? addMonths(t.date, -(t.currentInstallment! - 1))
      : t.date;

    // Calcula a data de fim da transação
    const endDate = isParcelled
      ? addMonths(startDate, t.totalInstallments! - 1)
      : startDate;

    return {
      name: t.name,
      amount: t.amount, // O 'amount' recebido da IA já é o valor TOTAL
      date: startDate,
      endDate: endOfDay(endDate),
      category: t.category,
      installments: t.totalInstallments || 1, // O número total de parcelas
      userId: user.id,
      type: TransactionType.EXPENSE,
      paymentMethod: TransactionPaymentMethod.CREDIT_CARD,
      isRecurring: false,
    };
  });

  await db.transaction.createMany({
    data: dataToCreate,
  });

  revalidatePath("/transactions");
  revalidatePath("/");
};
