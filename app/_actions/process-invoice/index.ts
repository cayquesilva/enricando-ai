"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAuth } from "../../_lib/auth";

// Inicializa o cliente da IA com a sua chave de API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Função para converter o buffer do ficheiro para Base64
function fileToGenerativePart(buffer: Buffer, mimeType: string) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

export const processInvoice = async (formData: FormData) => {
  await requireAuth();

  const file = formData.get("invoice") as File | null;
  if (!file) {
    throw new Error("Nenhum ficheiro enviado.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const imagePart = fileToGenerativePart(fileBuffer, file.type);

  const prompt = `
    Aja como um especialista em extração de dados financeiros de faturas de cartão de crédito do Brasil.
    Analise a imagem da fatura e extraia TODAS as transações de despesas listadas. Ignore totais, pagamentos ou resumos.

    Para cada transação, extraia o seguinte:
    1.  "name": O nome do estabelecimento.
    2.  "date": A data da transação no formato "YYYY-MM-DD".
    
    INSTRUÇÃO ESPECIAL PARA PARCELAS:
    - Se a descrição indicar uma parcela (ex: "parc 02/04" com valor de linha de 145.00), extraia:
    3.  "currentInstallment": O número da parcela atual (neste exemplo, 2).
    4.  "totalInstallments": O número total de parcelas (neste exemplo, 4).
    5.  "amount": **Calcule o valor TOTAL da compra** (valor da linha x número total de parcelas). Neste exemplo, seria 145.00 * 4 = 580.00.
    
    - Se NÃO for uma parcela, simplesmente extraia:
    3.  "amount": O valor que aparece na linha da fatura.

    Retorne os dados EXCLUSIVAMENTE como um array JSON com o seguinte formato:
    [
      {"name": "UBER TRIP", "amount": 18.90, "date": "2025-09-03"},
      {"name": "PAG*LOJASAMERICANAS", "amount": 580.00, "date": "2025-09-18", "currentInstallment": 2, "totalInstallments": 4}
    ]
    Não inclua nada além do array JSON.
  `;

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    const jsonResponse = responseText
      .replace("```json", "")
      .replace("```", "")
      .trim();
    const transactions = JSON.parse(jsonResponse);
    return transactions;
  } catch (error) {
    console.error("Erro na API do Gemini:", error);
    throw new Error(
      "Não foi possível analisar a fatura. Tente uma imagem mais nítida.",
    );
  }
};
