import { db } from "@/app/_lib/prisma";
import { getAuthenticatedUser } from "@/app/_lib/auth";
import { endOfMonth, startOfMonth } from "date-fns";

export const getCurrentMonthTransactions = async () => {
  const userId = await getAuthenticatedUser();
  
  if (!userId) {
    return 0;
  }

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
