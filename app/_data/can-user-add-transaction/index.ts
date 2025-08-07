import { TRANSACTION_LIMITS } from "@/app/_lib/constants";
import { getCurrentMonthTransactions } from "../get-current-month-transactions/index";

export const canUserAddTransaction = async (userId: string, isPremium: boolean = false) => {
  // Usuários premium têm transações ilimitadas
  if (isPremium) {
    return true;
  }

  // Usuários gratuitos têm limite mensal
  const currentMonthTransactions = await getCurrentMonthTransactions(userId);
  
  return currentMonthTransactions < TRANSACTION_LIMITS.FREE_PLAN_MONTHLY_LIMIT;
};
