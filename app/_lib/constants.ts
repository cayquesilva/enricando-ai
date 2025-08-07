export const TRANSACTION_LIMITS = {
  FREE_PLAN_MONTHLY_LIMIT: 10,
  MAX_INSTALLMENTS: 42,
  MIN_INSTALLMENTS: 1,
  MAX_AMOUNT: 999999.99,
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Não autorizado",
  PREMIUM_REQUIRED: "Você precisa de um Plano Premium",
  ADMIN_REQUIRED: "Acesso restrito a administradores",
  TRANSACTION_LIMIT_REACHED: "Você atingiu o limite de transações",
  INVALID_TRANSACTION_DATA: "Dados da transação inválidos",
  TRANSACTION_NOT_FOUND: "Transação não encontrada",
  USER_NOT_FOUND: "Usuário não encontrado",
  INVALID_CREDENTIALS: "Email ou senha inválidos",
  EMAIL_ALREADY_EXISTS: "Este email já está em uso",
  WEAK_PASSWORD: "A senha deve ter pelo menos 6 caracteres",
} as const;

export const SUCCESS_MESSAGES = {
  USER_CREATED: "Usuário criado com sucesso",
  LOGIN_SUCCESS: "Login realizado com sucesso",
  LOGOUT_SUCCESS: "Logout realizado com sucesso",
  TRANSACTION_CREATED: "Transação criada com sucesso",
  TRANSACTION_UPDATED: "Transação atualizada com sucesso",
  TRANSACTION_DELETED: "Transação deletada com sucesso",
  USER_UPDATED: "Usuário atualizado com sucesso",
} as const;