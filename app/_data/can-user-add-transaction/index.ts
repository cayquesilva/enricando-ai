import { db } from "../../_lib/prisma";
import { TRANSACTION_LIMITS } from "../../_lib/constants";
import { endOfMonth, startOfMonth } from "date-fns";

// A função agora aceita month e year para fazer a verificação no período correto
export const canUserAddTransaction = async (
  userId: string,
  isPremium: boolean,
  month: string,
  year: string,
  countToAdd: number = 1,
) => {
  if (isPremium) {
    return true; // Utilizadores Premium têm transações ilimitadas
  }

  // Cria as datas de início e fim do mês selecionado
  const referenceDate = new Date(`${year}-${month}-01`);
  const startDate = startOfMonth(referenceDate);
  const endDate = endOfMonth(referenceDate);

  // Conta as transações do utilizador apenas dentro do mês selecionado
  const transactionCount = await db.transaction.count({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return (
    transactionCount + countToAdd <= TRANSACTION_LIMITS.FREE_PLAN_MONTHLY_LIMIT
  );
};
