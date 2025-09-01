"use client";

import { Transaction, TransactionType } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import TransactionTypeBadge from "../_components/type-badge";
import {
  TRANSACTION_CATEGORY_LABELS,
  TRANSACTION_PAYMENT_METHOD_LABELS,
} from "@/app/_constants/transactions";
import { Button } from "@/app/_components/ui/button";
import { EditIcon, ArrowUpDown } from "lucide-react";
import { differenceInCalendarMonths } from "date-fns";
import { FormatCurrency } from "@/app/_utils/currency";
import DeleteTransactionButton from "../_components/delete-transaction-button";

interface GetColumnsProps {
  month: string;
  year: string;
  onEdit: (transaction: Transaction) => void;
}

export const getTransactionColumns = ({
  month,
  year,
  onEdit,
}: GetColumnsProps): ColumnDef<Transaction>[] => {
  // --- INÍCIO DA CORREÇÃO ---
  // Criamos a data de referência de forma segura para evitar problemas de fuso horário.
  // O mês no construtor do Date é 0-indexed (janeiro = 0), então subtraímos 1.
  const yearNum = parseInt(year);
  const monthIndex = parseInt(month) - 1;
  const referenceDate = new Date(yearNum, monthIndex, 1);
  // --- FIM DA CORREÇÃO ---

  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => <TransactionTypeBadge transaction={row.original} />,
    },
    {
      accessorKey: "category",
      header: "Categoria",
      cell: ({ row }) => TRANSACTION_CATEGORY_LABELS[row.original.category],
    },
    {
      accessorKey: "paymentMethod",
      header: "Método de Pagamento",
      cell: ({ row }) =>
        TRANSACTION_PAYMENT_METHOD_LABELS[row.original.paymentMethod],
    },
    {
      accessorKey: "installments",
      header: "Parcelas",
      cell: ({ row }) => {
        const transaction = row.original;
        if (transaction.installments > 1) {
          // A função de cálculo agora usa a `referenceDate` correta
          const currentInstallment =
            differenceInCalendarMonths(referenceDate, transaction.date) + 1;

          // Garante que a parcela atual está dentro do intervalo válido
          if (
            currentInstallment >= 1 &&
            currentInstallment <= transaction.installments
          ) {
            return `${currentInstallment}/${transaction.installments}`;
          }
        }
        return "-";
      },
    },
    {
      accessorKey: "date",
      header: "Data",
      cell: ({ row }) =>
        new Date(row.original.date).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        }),
    },
    {
      accessorKey: "amount",
      header: "Valor",
      cell: ({ row }) => {
        const transaction = row.original;
        const installmentAmount =
          Number(transaction.amount) / transaction.installments;
        const isExpense = transaction.type === TransactionType.EXPENSE;

        return (
          <span
            className={`font-bold ${isExpense ? "text-red-500" : "text-primary"}`}
          >
            {isExpense ? "- " : "+ "}
            {FormatCurrency(installmentAmount)}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(transaction)}
            >
              <EditIcon size={14} />
            </Button>
            <DeleteTransactionButton transactionId={transaction.id} />
          </div>
        );
      },
    },
  ];
};
