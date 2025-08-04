import { z } from "zod";
import { isMatch } from "date-fns";
import {
  TransactionCategory,
  TransactionPaymentMethod,
  TransactionType,
} from "@prisma/client";
import { TRANSACTION_LIMITS } from "./constants";

export const dateParamSchema = z.object({
  month: z.string().refine((value) => isMatch(value, "MM"), {
    message: "Mês deve estar no formato MM",
  }),
  year: z.string().refine((value) => isMatch(value, "yyyy"), {
    message: "Ano deve estar no formato yyyy",
  }),
});

export const transactionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  amount: z
    .number({
      required_error: "Valor é obrigatório",
    })
    .positive("Valor deve ser positivo")
    .max(TRANSACTION_LIMITS.MAX_AMOUNT, `Valor máximo é R$ ${TRANSACTION_LIMITS.MAX_AMOUNT.toLocaleString("pt-BR")}`),
  type: z.nativeEnum(TransactionType, {
    required_error: "Tipo é obrigatório",
  }),
  category: z.nativeEnum(TransactionCategory, {
    required_error: "Categoria é obrigatória",
  }),
  paymentMethod: z.nativeEnum(TransactionPaymentMethod, {
    required_error: "Método de pagamento é obrigatório",
  }),
  date: z.date({
    required_error: "Data é obrigatória",
  }),
  installments: z
    .number()
    .min(TRANSACTION_LIMITS.MIN_INSTALLMENTS, "Mínimo 1 parcela")
    .max(TRANSACTION_LIMITS.MAX_INSTALLMENTS, "Máximo 42 parcelas")
    .default(1),
});

export const deleteTransactionSchema = z.object({
  transactionId: z.string().uuid("ID da transação inválido"),
});