export const TRANSACTION_LIMITS = {
  FREE_PLAN_MONTHLY_LIMIT: 10,
  MAX_INSTALLMENTS: 42,
  MIN_INSTALLMENTS: 1,
  MAX_AMOUNT: 999999.99,
} as const;

export const SUBSCRIPTION_PLANS = {
  FREE: "free",
  PREMIUM: "premium",
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Não autorizado",
  PREMIUM_REQUIRED: "Você precisa de um Plano Premium",
  TRANSACTION_LIMIT_REACHED: "Você atingiu o limite de transações",
  INVALID_TRANSACTION_DATA: "Dados da transação inválidos",
  TRANSACTION_NOT_FOUND: "Transação não encontrada",
} as const;