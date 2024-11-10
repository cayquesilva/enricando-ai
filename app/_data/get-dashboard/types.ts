import { TransactionType } from "@prisma/client";

export type TransactionpercentagePerType = {
  [key in TransactionType]: number;
};
