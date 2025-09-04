"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { ScanLineIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import Tesseract from "tesseract.js";
import { parseReceiptText, ParsedReceiptData } from "../_lib/ocr-parser";

interface SingleReceiptScannerProps {
  onDataExtracted: (data: ParsedReceiptData) => void;
}

const SingleReceiptScanner = ({
  onDataExtracted,
}: SingleReceiptScannerProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    toast.info("A ler a nota fiscal...");

    try {
      const result = await Tesseract.recognize(file, "por");
      const parsedData = parseReceiptText(result.data.text);

      if (!parsedData.amount) {
        toast.warning("Não foi possível detetar o valor total.");
      } else {
        toast.success("Nota fiscal lida com sucesso!");
      }

      onDataExtracted(parsedData);
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao processar a imagem.");
    } finally {
      setIsLoading(false);
      event.target.value = "";
    }
  };

  return (
    <Button asChild variant="outline">
      <label htmlFor="single-receipt-upload">
        {isLoading ? (
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ScanLineIcon className="mr-2 h-4 w-4" />
        )}
        Analisar Nota Fiscal
        <input
          id="single-receipt-upload"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="sr-only"
          disabled={isLoading}
        />
      </label>
    </Button>
  );
};

export default SingleReceiptScanner;
