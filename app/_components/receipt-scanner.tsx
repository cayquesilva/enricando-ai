"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { CameraIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import Tesseract from "tesseract.js";
import { parseReceiptText, ParsedReceiptData } from "../_lib/ocr-parser";

// O componente aceita uma função para ser chamada quando os dados forem extraídos
interface ReceiptScannerProps {
  onDataExtracted: (data: ParsedReceiptData) => void;
}

const ReceiptScanner = ({ onDataExtracted }: ReceiptScannerProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    toast.info("A ler a nota fiscal... Isto pode demorar um momento.");

    try {
      // Executa o OCR na imagem
      const result = await Tesseract.recognize(file, "por", {
        // 'por' para português
        logger: (m) => console.log(m), // Opcional: mostra o progresso no console
      });

      // Analisa o texto extraído
      const parsedData = parseReceiptText(result.data.text);

      if (!parsedData.amount) {
        toast.warning(
          "Não foi possível detetar o valor total. Por favor, preencha manualmente.",
        );
      } else {
        toast.success("Dados da nota fiscal lidos com sucesso!");
      }

      // Envia os dados extraídos para o componente pai
      onDataExtracted(parsedData);
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao processar a imagem.");
    } finally {
      setIsLoading(false);
      // Reseta o input para permitir selecionar o mesmo ficheiro novamente
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
          Ler Nota Fiscal
          <input
            id="receipt-upload"
            type="file"
            accept="image/*"
            capture="environment" // Pede para usar a câmara em dispositivos móveis
            onChange={handleFileChange}
            className="sr-only" // Esconde o input feio
            disabled={isLoading}
          />
        </label>
      </Button>
    </>
  );
};

export default ReceiptScanner;
