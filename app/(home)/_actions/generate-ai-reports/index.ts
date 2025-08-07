"use server";

import { db } from "@/app/_lib/prisma";
import { requireAuth } from "@/app/_lib/auth";
import { dateParamSchema } from "@/app/_lib/validations";
import { ERROR_MESSAGES } from "@/app/_lib/constants";
import OpenAI from "openai";

type GenerateAiReportParams = {
  month: string;
  year: string;
};

export const generateAiReport = async (params: GenerateAiReportParams) => {
  // Validação dos parâmetros
  const { month, year } = dateParamSchema.parse(params);
  
  // Autenticação
  const user = await requireAuth();

  // Verificar plano premium
  if (!user.isPremium) {
    throw new Error(ERROR_MESSAGES.PREMIUM_REQUIRED);
  }

  // Verificar variáveis de ambiente
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Chave da OpenAI não configurada");
  }

  // Criar instância da OpenAI
  const openAi = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Buscar transações do mês
  const transactions = await db.transaction.findMany({
    where: {
      date: {
        gte: new Date(`${year}-${month}-01`),
        lt: new Date(`${year}-${String(Number(month) + 1).padStart(2, '0')}-01`),
      },
      userId: user.id,
    },
  });

  if (transactions.length === 0) {
    return "Não há transações suficientes para gerar um relatório neste período.";
  }

  // Preparar dados para a IA
  const content = `Gere um relatório com insights sobre as minhas finanças,
     com dicas e orientações de como melhorar minha vida financeira.
      As transações estão divididas por ponto e vírgula. A estrutura de cada uma é 
      {DATA}-{TIPO}-{VALOR}-{CATEGORIA}. São elas:
      ${transactions
        .map(
          (transaction) =>
            `${transaction.date.toLocaleDateString("pt-BR")}-R$${Number(transaction.amount).toFixed(2)}-${transaction.type}-${transaction.category}`,
        )
        .join(";")}`;

  // Gerar relatório com IA
  const completion = await openAi.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Você é um especialista em gestão e organização de finanças pessoais. Você ajuda as pessoas a organizarem melhor as suas finanças de forma simples e prática. Forneça insights específicos, dicas acionáveis e recomendações personalizadas baseadas nos dados fornecidos.",
      },
      {
        role: "user",
        content,
      },
    ],
  });

  const report = completion.choices[0].message.content;
  
  if (!report) {
    throw new Error("Não foi possível gerar o relatório");
  }
  
  return report;
};
