import { db } from "@/app/_lib/prisma";
import { TransactionType } from "@prisma/client";
import { TotalExpensePerCategory, TransactionpercentagePerType } from "./types";
import { auth } from "@clerk/nextjs/server";
import { addMonths, subDays, startOfMonth, endOfMonth } from "date-fns";

export const getDashboard = async (month: string, year: string) => {
  //segurança de autenticação
  const { userId } = await auth();

  const referenceDate = new Date(`${year}-${month}-01`);

  // Defina o intervalo para o mês atual
  const currentMonthStart = startOfMonth(referenceDate);
  const currentMonthEnd = endOfMonth(referenceDate);

  //console.log("inicio do mes: ", currentMonthStart);
  //console.log("fim do mes: ", currentMonthEnd);

  if (!userId) {
    throw new Error("Não autorizado.");
  }

  //define uma condição where, pare ser adicionada abaixo, garantindo que o mês receba todos os dias dele 01 a 31
  const where = {
    userId,
    date: {
      gte: currentMonthStart, // Transações do mês atual
      lte: currentMonthEnd,
    },
  };

  //db.transaction.aggregate onde o tipo é X somando a coluna amount. (busca em banco e soma automatica)
  const depositsTotal = Number(
    (
      await db.transaction.aggregate({
        where: { ...where, type: "DEPOSIT" },
        _sum: { amount: true },
      })
    )?._sum?.amount,
  );
  const investmentsTotal = Number(
    (
      await db.transaction.aggregate({
        where: { ...where, type: "INVESTMENT" },
        _sum: { amount: true },
      })
    )?._sum?.amount,
  );

  const expenses = await db.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      date: {
        gte: startOfMonth(referenceDate), // Início do mês de referência
        lte: endOfMonth(referenceDate), // Fim do mês de referência
      },
    },
  });

  // Mapear parcelas individuais para cada transação
  const distributedExpenses = expenses.flatMap((transaction) => {
    const installmentAmount =
      Number(transaction.amount) / (transaction.installments || 1); // Valor por parcela
    return Array.from({ length: transaction.installments }, (_, index) => ({
      date: addMonths(transaction.date, index), // Data de cada parcela
      amount: installmentAmount, // Valor da parcela
    }));
  });

  // Filtrar apenas as parcelas que pertencem ao mês e ano de referência
  // Considera também parcelas futuras
  const filteredDistributedExpenses = distributedExpenses.filter(
    (installment) => {
      const installmentDate = installment.date;
      // Verificar se a parcela é do mês de referência ou está a vencer no mês de referência
      return (
        (installmentDate.getFullYear() === referenceDate.getFullYear() &&
          installmentDate.getMonth() === referenceDate.getMonth()) ||
        // Considera parcelas a vencer no mês de referência
        (installmentDate > endOfMonth(referenceDate) &&
          installmentDate.getFullYear() === referenceDate.getFullYear())
      );
    },
  );

  // Somar as despesas do mês
  const expensesTotal = filteredDistributedExpenses.reduce(
    (total, installment) => total + installment.amount,
    0,
  );

  //salvando o saldo
  const balance = depositsTotal - investmentsTotal - expensesTotal;

  // Busque todas as transações (podemos filtrar inicialmente por tipo ou data, dependendo do banco)
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      OR: [
        {
          date: {
            lte: currentMonthEnd, // Inclui transações até o final do mês de referência
          },
        },
        { installments: { gte: 1 } }, // Inclui transações parceladas
      ],
    },
  });

  // Calcule o total, considerando parcelas a vencer
  const transactionsTotal = transactions.reduce((total, transaction) => {
    if (transaction.installments && transaction.installments > 1) {
      // Valor de cada parcela
      const installmentAmount =
        Number(transaction.amount) / transaction.installments;

      // Verifique cada parcela individualmente
      for (let i = 0; i < transaction.installments; i++) {
        const installmentDate = addMonths(transaction.date, i); // Data da parcela

        // Considera apenas parcelas dentro do intervalo do mês/ano selecionado, incluindo futuras
        if (
          installmentDate.getFullYear() === referenceDate.getFullYear() &&
          installmentDate.getMonth() === referenceDate.getMonth()
        ) {
          total += installmentAmount; // Adiciona o valor da parcela
        }
      }
    } else {
      // Transações não parceladas
      if (
        transaction.date >= currentMonthStart &&
        transaction.date <= currentMonthEnd
      ) {
        total += Number(transaction.amount); // Soma o valor total
      }
    }

    return total;
  }, 0);

  const typesPercentage: TransactionpercentagePerType = {
    [TransactionType.DEPOSIT]: Math.round(
      (Number(depositsTotal || 0) / Number(transactionsTotal)) * 100,
    ),
    [TransactionType.EXPENSE]: Math.round(
      (Number(expensesTotal || 0) / Number(transactionsTotal)) * 100,
    ),
    [TransactionType.INVESTMENT]: Math.round(
      (Number(investmentsTotal || 0) / Number(transactionsTotal)) * 100,
    ),
  };

  const expensesCategory = await db.transaction.findMany({
    where: {
      userId,
      type: TransactionType.EXPENSE,
      OR: [
        {
          date: {
            lte: currentMonthEnd, // Inclui transações até o final do mês de referência
          },
        },
        { installments: { gte: 1 } }, // Inclui transações parceladas
      ],
    },
    select: {
      category: true,
      amount: true,
      installments: true,
      date: true, // Necessário para calcular as parcelas futuras
    },
  });

  const totalExpensePerCategory: TotalExpensePerCategory[] = [];

  // Agrupa as transações por categoria e ajusta o valor considerando as parcelas
  expensesCategory.forEach((expense) => {
    const existingCategory = totalExpensePerCategory.find(
      (category) => category.category === expense.category,
    );

    // Ajuste: divide o valor da transação pelo número de parcelas
    const adjustedAmount = Number(expense.amount) / (expense.installments || 1);

    // Se for uma transação parcelada, precisamos verificar quais parcelas estão a vencer
    if (expense.installments && expense.installments > 1) {
      for (let i = 0; i < expense.installments; i++) {
        const installmentMonth = addMonths(expense.date, i); // Calcula o mês da parcela

        // Verifica se a parcela cai dentro do intervalo de meses/anos selecionados
        if (
          installmentMonth.getFullYear() === referenceDate.getFullYear() &&
          installmentMonth.getMonth() === referenceDate.getMonth()
        ) {
          // Se a parcela é do mês/ano de referência, adiciona o valor ajustado
          if (existingCategory) {
            existingCategory.totalAmount += adjustedAmount;
          } else {
            totalExpensePerCategory.push({
              category: expense.category,
              totalAmount: adjustedAmount,
              percentageOfTotal: 0, // Inicializamos com 0, a porcentagem será calculada depois
            });
          }
        }
      }
    } else {
      // Transações não parceladas: basta adicionar o valor completo
      if (
        expense.date >= currentMonthStart &&
        expense.date <= currentMonthEnd
      ) {
        if (existingCategory) {
          existingCategory.totalAmount += adjustedAmount;
        } else {
          totalExpensePerCategory.push({
            category: expense.category,
            totalAmount: adjustedAmount,
            percentageOfTotal: 0, // Inicializamos com 0, a porcentagem será calculada depois
          });
        }
      }
    }
  });

  // Agora calcule a porcentagem de cada categoria
  totalExpensePerCategory.forEach((category) => {
    category.percentageOfTotal = Math.round(
      (category.totalAmount / expensesTotal) * 100,
    );
  });

  //busca as ultimas 15 transações do mês
  const lastTransactions = await db.transaction.findMany({
    where: {
      userId,
      OR: [
        // Transações no mês atual
        {
          date: {
            gte: currentMonthStart, // Início do mês atual
            lte: currentMonthEnd, // Fim do mês atual
          },
        },
        // Transações anteriores com parcelas futuras
        {
          installments: { gte: 1 }, // Transações parceladas
          date: {
            lte: currentMonthEnd, // Até o fim do mês atual
          },
        },
      ],
    },
    orderBy: { date: "desc" }, // Ordena pela data, mais recentes primeiro
    take: 15, // Limita o número de transações a 15
  });

  //console.log("transações sem filtro:", lastTransactions); // Log para verificar o resultado da consulta

  const filteredTransactions = lastTransactions.filter((transaction) => {
    // Calcula a data limite com base no número de installments
    const maxValidDate = addMonths(transaction.date, transaction.installments);

    // Verifica se a transação deve ser considerada
    return (
      // Condição para transações que se enquadram no período entre a data de referência e a data final do mês
      transaction.date <= subDays(startOfMonth(maxValidDate), 1) &&
      subDays(startOfMonth(maxValidDate), 1) >=
        subDays(addMonths(referenceDate, 1), 1) &&
      transaction.date <= subDays(addMonths(referenceDate, 1), 1) &&
      // Adiciona a condição para verificar se a transação foi do mês atual ou se possui parcelas em aberto
      (transaction.date >= currentMonthStart ||
        (transaction.installments && transaction.installments > 1))
    );
  });

  //console.log("Transações filtradas:", filteredTransactions);

  return {
    balance,
    depositsTotal,
    investmentsTotal,
    expensesTotal,
    typesPercentage,
    totalExpensePerCategory,
    lastTransactions: JSON.parse(JSON.stringify(filteredTransactions)),
  };
};
