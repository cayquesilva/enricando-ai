import { Button } from "@/app/_components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { TRANSACTION_PAYMENT_METHOD_ICONS } from "@/app/_constants/transactions";
import { FormatCurrency } from "@/app/_utils/currency";
import { Transaction, TransactionType } from "@prisma/client";
import { differenceInMonths, startOfMonth } from "date-fns";
import Image from "next/image";
import Link from "next/link";

interface LastTransactionsProps {
  lastTransactions: Transaction[];
  month: string;
}

const LastTransactions = ({
  lastTransactions,
  month,
}: LastTransactionsProps) => {
  const getAmountColor = (transaction: Transaction) => {
    if (transaction.type === TransactionType.EXPENSE) {
      return "text-red-500";
    }
    if (transaction.type === TransactionType.DEPOSIT) {
      return "text-primary";
    }
    return "text-white";
  };

  const getAmountPrefix = (transaction: Transaction) => {
    if (transaction.type === TransactionType.EXPENSE) {
      return "-";
    }
    return "+";
  };

  return (
    <ScrollArea className="h-full rounded-md border">
      <CardHeader className="flex-col items-center justify-between gap-2 text-center lg:flex-row lg:text-left">
        <CardTitle className="font-bold">Ultimas Transações</CardTitle>
        <Button variant="outline" className="rounded-full font-bold" asChild>
          <Link href="/transactions">Ver mais...</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {lastTransactions.map((transaction) => (
          <div
            className="flex items-center justify-between gap-2 md:flex-col lg:flex lg:flex-row lg:gap-0"
            key={transaction.id}
          >
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-white bg-opacity-[3%] p-3">
                <Image
                  src={
                    TRANSACTION_PAYMENT_METHOD_ICONS[transaction.paymentMethod]
                  }
                  width={20}
                  height={20}
                  alt={
                    TRANSACTION_PAYMENT_METHOD_ICONS[transaction.paymentMethod]
                  }
                />
              </div>
              <div>
                <p className="text-sm font-bold">{transaction.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  {transaction.paymentMethod === "CREDIT_CARD"
                    ? `parc. (${differenceInMonths(new Date(`2024-${month}-30`), startOfMonth(transaction.date)) + 1} / ${transaction.installments})`
                    : ""}
                </p>
              </div>
            </div>
            <p
              className={`mt-1 text-sm font-bold lg:mt-0 ${getAmountColor(transaction)}`}
            >
              {`${getAmountPrefix(transaction)} ${FormatCurrency(Number(transaction.amount) / transaction.installments)}`}
            </p>
          </div>
        ))}
      </CardContent>
    </ScrollArea>
  );
};

export default LastTransactions;
