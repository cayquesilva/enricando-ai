import {
  TransactionCategory,
  TransactionPaymentMethod,
  TransactionType,
} from "@prisma/client";

export const TRANSACTION_CATEGORY_LABELS = {
  EDUCATION: "Educação",
  ENTERTAINMENT: "Lazer",
  FOOD: "Alimentação",
  HOUSING: "Habitação",
  HEALTH: "Saúde",
  OTHER: "Outros",
  SALARY: "Salário",
  TRANSPORTATION: "Transporte",
  UTILITY: "Utilidades",
  ACOES: "Ações",
  CDB: "CDB",
  CDI: "CDI",
  CRIPTO: "Cripto",
  FUNDOS: "Fundos de Investimento",
  RFIXA: "Renda Fixa",
  POUPANCA: "Poupança",
  TDIRETO: "Tesouro Direto",
};

export const TRANSACTION_PAYMENT_METHOD_ICONS = {
  [TransactionPaymentMethod.CREDIT_CARD]: "credit-card.svg",
  [TransactionPaymentMethod.DEBIT_CARD]: "debit-card.svg",
  [TransactionPaymentMethod.BANK_TRANSFER]: "bank-transfer.svg",
  [TransactionPaymentMethod.BANK_SLIP]: "bank-slip.svg",
  [TransactionPaymentMethod.CASH]: "money.svg",
  [TransactionPaymentMethod.PIX]: "pix.svg",
  [TransactionPaymentMethod.OTHER]: "other.svg",
};

export const TRANSACTION_PAYMENT_METHOD_LABELS = {
  BANK_TRANSFER: "Transferência Bancária",
  BANK_SLIP: "Boleto Bancário",
  CASH: "Dinheiro",
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  OTHER: "Outros",
  PIX: "Pix",
};

export const TRANSACTION_TYPES_OPTIONS = [
  {
    value: TransactionType.EXPENSE,
    label: "Despesa",
  },
  {
    value: TransactionType.DEPOSIT,
    label: "Receita",
  },
  {
    value: TransactionType.INVESTMENT,
    label: "Investimento",
  },
];

export const TRANSACTION_PAYMENT_METHOD_OPTIONS = [
  {
    value: TransactionPaymentMethod.BANK_TRANSFER,
    label: TRANSACTION_PAYMENT_METHOD_LABELS.BANK_TRANSFER,
  },
  {
    value: TransactionPaymentMethod.BANK_SLIP,
    label: TRANSACTION_PAYMENT_METHOD_LABELS.BANK_SLIP,
  },
  {
    value: TransactionPaymentMethod.CASH,
    label: TRANSACTION_PAYMENT_METHOD_LABELS.CASH,
  },
  {
    value: TransactionPaymentMethod.CREDIT_CARD,
    label: TRANSACTION_PAYMENT_METHOD_LABELS.CREDIT_CARD,
  },
  {
    value: TransactionPaymentMethod.DEBIT_CARD,
    label: TRANSACTION_PAYMENT_METHOD_LABELS.DEBIT_CARD,
  },
  {
    value: TransactionPaymentMethod.OTHER,
    label: TRANSACTION_PAYMENT_METHOD_LABELS.OTHER,
  },
  {
    value: TransactionPaymentMethod.PIX,
    label: TRANSACTION_PAYMENT_METHOD_LABELS.PIX,
  },
];

export const TRANSACTION_CATEGORY_OPTIONS = [
  {
    value: TransactionCategory.EDUCATION,
    label: TRANSACTION_CATEGORY_LABELS.EDUCATION,
  },
  {
    value: TransactionCategory.ENTERTAINMENT,
    label: TRANSACTION_CATEGORY_LABELS.ENTERTAINMENT,
  },
  {
    value: TransactionCategory.FOOD,
    label: TRANSACTION_CATEGORY_LABELS.FOOD,
  },
  {
    value: TransactionCategory.HOUSING,
    label: TRANSACTION_CATEGORY_LABELS.HOUSING,
  },
  {
    value: TransactionCategory.HEALTH,
    label: TRANSACTION_CATEGORY_LABELS.HEALTH,
  },
  {
    value: TransactionCategory.OTHER,
    label: TRANSACTION_CATEGORY_LABELS.OTHER,
  },
  {
    value: TransactionCategory.SALARY,
    label: TRANSACTION_CATEGORY_LABELS.SALARY,
  },
  {
    value: TransactionCategory.TRANSPORTATION,
    label: TRANSACTION_CATEGORY_LABELS.TRANSPORTATION,
  },
  {
    value: TransactionCategory.UTILITY,
    label: TRANSACTION_CATEGORY_LABELS.UTILITY,
  },
];

export const TRANSACTION_INVESTMENTS_CATEGORY_OPTIONS = [
  {
    value: TransactionCategory.ACOES,
    label: TRANSACTION_CATEGORY_LABELS.ACOES,
  },
  {
    value: TransactionCategory.CDB,
    label: TRANSACTION_CATEGORY_LABELS.CDB,
  },
  {
    value: TransactionCategory.CDI,
    label: TRANSACTION_CATEGORY_LABELS.CDI,
  },
  {
    value: TransactionCategory.CRIPTO,
    label: TRANSACTION_CATEGORY_LABELS.CRIPTO,
  },
  {
    value: TransactionCategory.FUNDOS,
    label: TRANSACTION_CATEGORY_LABELS.FUNDOS,
  },
  {
    value: TransactionCategory.RFIXA,
    label: TRANSACTION_CATEGORY_LABELS.RFIXA,
  },
  {
    value: TransactionCategory.POUPANCA,
    label: TRANSACTION_CATEGORY_LABELS.POUPANCA,
  },
  {
    value: TransactionCategory.TDIRETO,
    label: TRANSACTION_CATEGORY_LABELS.TDIRETO,
  },
];
