"use server";

import { db } from "@/app/_lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { GenerateAiReportSchema, generateAiReportSchema } from "./schema";

export const generateAiReport = async ({
  month,
  year,
}: GenerateAiReportSchema) => {
  //valida se mês é válido
  generateAiReportSchema.parse({ month, year });

  //verifica se está logado
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Não autorizado.");
  }

  //verifica se tem plano premium no clerk
  const user = await clerkClient().users.getUser(userId);
  const hasPremiumPlan = user.publicMetadata.subscriptionPlan === "premium";
  if (!hasPremiumPlan) {
    throw new Error("Você precisa de um Plano Premium");
  }

  //cria instancia da opeai
  const openAi = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  //pega as transações do mÊs recebido
  const transactions = await db.transaction.findMany({
    where: {
      date: {
        gte: new Date(`${year}-${month}-01`),
        lt: new Date(`${year}-${month}-31`),
      },
      userId,
    },
  });

  //manda as transações pra o ChatGPT e pede pra que ele gere um relatório
  const content = `Gere um relatório com insights sobre as minhas finanças,
     com dicas e orientações de como melhorar minha vida financeira.
      As transações estão divididas por ponto e vírgula. A estrutura de cada uma é 
      {DATA}-{TIPO}-{VALOR}-{CATEGORIA}. São elas:
      ${transactions
        .map(
          (transaction) =>
            `${transaction.date.toLocaleDateString("pt-BR")}-R$${transaction.amount}-${transaction.type}-${transaction.category}`,
        )
        .join(";")}`;

  //configurando modelo de IA, role system vai moldar a persona, role user é o usuario mesmo...
  const completion = await openAi.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Você é um especialista em gestão e organização de finanças pessoais. Você ajuda as pessoas a organizarem melhor as suas finanças de forma simples e possível.",
      },
      {
        role: "user",
        content,
      },
    ],
  });

  //pegar a resposta do Chatgpt e mandar pro usuario

  return completion.choices[0].message.content;
};
