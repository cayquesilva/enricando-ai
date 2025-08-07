import { db } from "@/app/_lib/prisma";
import { endOfMonth, startOfMonth } from "date-fns";

export const getCurrentMonthTransactions = async (userId: string) => {
  return db.transaction.count({
    where: {
      userId,
      createdAt: {
        gte: startOfMonth(new Date()),
        lte: endOfMonth(new Date()),
      },
    },
  });
};
