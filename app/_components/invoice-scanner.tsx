"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { CameraIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { processInvoice } from "../_actions/process-invoice";

// 1. Definimos o tipo para uma única transação extraída pela IA
// Este tipo pode ser exportado e reutilizado noutros locais, como na sua página
export type ExtractedTransaction = {
  name: string;
  amount: number;
  date?: string;
};

// 2. A interface agora espera uma função que recebe um ARRAY de ExtractedTransaction
interface ReceiptScannerProps {
  onDataExtracted: (data: ExtractedTransaction[]) => void;
}

const ReceiptScanner = ({ onDataExtracted }: ReceiptScannerProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    toast.info("A analisar a fatura com IA... Isto pode demorar um pouco.");

    const formData = new FormData();
    formData.append("invoice", file);

    try {
      // A action 'processInvoice' retorna um array de transações
      const transactions = await processInvoice(formData);

      if (!transactions || transactions.length === 0) {
        toast.warning("Nenhuma transação encontrada na fatura.");
        setIsLoading(false);
        return;
      }

      toast.success(`${transactions.length} transações encontradas!`);

      // Enviamos o array completo para o componente pai
      onDataExtracted(transactions);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao processar a fatura.",
      );
    } finally {
      setIsLoading(false);
      event.target.value = "";
    }
  };

  return (
    <>
      <Button asChild variant="outline">
        <label htmlFor="receipt-upload">
          {isLoading ? (
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CameraIcon className="mr-2 h-4 w-4" />
          )}
          Analisar Fatura
          <input
            id="receipt-upload"
            type="file"
            accept="image/*,application/pdf"
            capture="environment"
            onChange={handleFileChange}
            className="sr-only"
            disabled={isLoading}
          />
        </label>
      </Button>
    </>
  );
};

export default ReceiptScanner;
