import { clerkClient } from "@clerk/nextjs/server";
import { getAuthenticatedUser } from "@/app/_lib/auth";
import { TRANSACTION_LIMITS, SUBSCRIPTION_PLANS } from "@/app/_lib/constants";
import { getCurrentMonthTransactions } from "../get-current-month-transactions/index";

export const canUserAddTransaction = async () => {
  const userId = await getAuthenticatedUser();
  
  if (!userId) {
    return false;
  }

  const user = await clerkClient().users.getUser(userId);
  
  // Usuários premium têm transações ilimitadas
  if (user.publicMetadata.subscriptionPlan === SUBSCRIPTION_PLANS.PREMIUM) {
    return true;
  }

  // Usuários gratuitos têm limite mensal
  const currentMonthTransactions = await getCurrentMonthTransactions();
  
  return currentMonthTransactions < TRANSACTION_LIMITS.FREE_PLAN_MONTHLY_LIMIT;
};
