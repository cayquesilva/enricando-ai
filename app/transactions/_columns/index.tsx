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
import { Badge } from "@/app/_components/ui/badge";

// 1. O tipo de dados para cada linha agora pode ser uma transação normal
// ou o nosso objeto separador especial.
type TransactionRow = Transaction & { isSeparator?: boolean };

interface GetColumnsProps {
  month: string;
  year: string;
  onEdit: (transaction: Transaction) => void;
}

// A função agora espera receber dados do tipo 'TransactionRow'.
export const getTransactionColumns = ({
  month,
  year,
  onEdit,
}: GetColumnsProps): ColumnDef<TransactionRow>[] => {
  const yearNum = parseInt(year);
  const monthIndex = parseInt(month) - 1;
  const referenceDate = new Date(yearNum, monthIndex, 1);

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
      // 2. A célula do nome agora renderiza o separador ou o nome da transação.
      cell: ({ row }) => {
        const transaction = row.original;

        // Se esta linha for um separador, renderize-o de forma especial.
        if (transaction.isSeparator) {
          return (
            <span className="whitespace-nowrap text-green-500">
              Parcelas de Meses Anteriores
            </span>
          );
        }

        return <span className="font-bold">{transaction.name}</span>;
      },
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        // Não renderiza nada para a linha do separador.
        // Se esta linha for um separador, renderize-o de forma especial.
        if (row.original.isSeparator) {
          return null;
        }
        return <TransactionTypeBadge transaction={row.original} />;
      },
    },
    {
      accessorKey: "category",
      header: "Categoria",
      cell: ({ row }) => {
        if (row.original.isSeparator) {
          return null;
        }
        return TRANSACTION_CATEGORY_LABELS[row.original.category];
      },
    },
    {
      accessorKey: "paymentMethod",
      header: "Método de Pagamento",
      cell: ({ row }) => {
        if (row.original.isSeparator) {
          return null;
        }
        return TRANSACTION_PAYMENT_METHOD_LABELS[row.original.paymentMethod];
      },
    },
    {
      accessorKey: "installments",
      header: "Parcelas",
      cell: ({ row }) => {
        if (row.original.isSeparator) {
          return null;
        }
        const transaction = row.original;

        if (transaction.isRecurring) {
          return <Badge variant="outline">Recorrente</Badge>;
        }

        if (transaction.installments > 1) {
          const currentInstallment =
            differenceInCalendarMonths(referenceDate, transaction.date) + 1;

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
      cell: ({ row }) => {
        if (row.original.isSeparator) {
          return null;
        }
        return new Date(row.original.date).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        });
      },
    },
    {
      accessorKey: "amount",
      header: "Valor",
      cell: ({ row }) => {
        if (row.original.isSeparator) {
          return null;
        }
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
        if (row.original.isSeparator) {
          return null;
        }
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
            <DeleteTransactionButton
              transactionId={transaction.id}
              month={month}
              year={year}
            />
          </div>
        );
      },
    },
  ];
};
