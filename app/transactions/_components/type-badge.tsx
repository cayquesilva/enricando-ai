import { Badge } from "@/app/_components/ui/badge";
import {
  Transaction as PrismaTransaction,
  TransactionType,
} from "@prisma/client";
import { CircleIcon } from "lucide-react";

type Transaction = Omit<PrismaTransaction, "amount"> & { amount: number };

interface TransactionTypeBadgeProps {
  transaction: Transaction;
}

const TransactionTypeBadge = ({ transaction }: TransactionTypeBadgeProps) => {
  if (transaction.type === TransactionType.DEPOSIT) {
    return (
      <Badge className="bg-green-600 bg-opacity-10 font-bold text-primary hover:bg-muted">
        <CircleIcon className="mr-2 fill-primary" size={10} />
        Depósito
      </Badge>
    );
  }
  if (transaction.type === TransactionType.EXPENSE) {
    return (
      <Badge className="bg-red-600 bg-opacity-10 font-bold text-red-600 hover:bg-muted">
        <CircleIcon className="mr-2 fill-red-600" size={10} />
        Despesa
      </Badge>
    );
  }
  return (
    <Badge className="bg-white bg-opacity-10 font-bold text-white hover:bg-muted">
      <CircleIcon className="mr-2 fill-white" size={10} />
      Investimento
    </Badge>
  );
};

export default TransactionTypeBadge;
