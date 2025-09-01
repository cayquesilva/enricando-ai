import { parse, isValid } from "date-fns";

export interface ParsedReceiptData {
  amount?: number;
  name?: string;
  date?: Date;
}

export const parseReceiptText = (text: string): ParsedReceiptData => {
  const lines = text.split("\n");
  const result: ParsedReceiptData = {};

  // 1. Tenta encontrar o nome da empresa (geralmente uma das primeiras linhas)
  // Esta é uma heurística simples; pode ser melhorada.
  if (lines.length > 0) {
    result.name = lines[0].trim();
  }

  // 2. Tenta encontrar o valor total
  // Procura por linhas que contenham "TOTAL", "VALOR A PAGAR", etc.
  const totalKeywords = ["TOTAL", "VALOR A PAGAR", "TOTAL GERAL"];
  const totalLine = lines.find((line) =>
    totalKeywords.some((kw) => line.toUpperCase().includes(kw)),
  );

  if (totalLine) {
    const match = totalLine.match(/[\d.,]+/);
    if (match) {
      // Converte o formato brasileiro (ex: "1.234,56") para um número
      const numberString = match[0].replace(/\./g, "").replace(",", ".");
      result.amount = parseFloat(numberString);
    }
  }

  // 3. Tenta encontrar a data
  // Procura por um padrão DD/MM/YYYY
  const dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/);
  if (dateMatch) {
    const date = parse(dateMatch[0], "dd/MM/yyyy", new Date());
    if (isValid(date)) {
      result.date = date;
    }
  }

  return result;
};
