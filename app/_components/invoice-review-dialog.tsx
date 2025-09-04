"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { TRANSACTION_CATEGORY_OPTIONS } from "../_constants/transactions";
import { TransactionCategory } from "@prisma/client";
import { saveExtractedTransactions } from "../_actions/save-extracted-transactions";
import { toast } from "sonner";
import { ScrollArea } from "./ui/scroll-area";
import { TrashIcon } from "lucide-react";

export type ExtractedTransaction = {
  name: string;
  amount: number;
  date?: string; // A IA pode não encontrar a data
  category?: TransactionCategory;
};

interface InvoiceReviewDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  transactions: ExtractedTransaction[];
  onSuccess: () => void;
}

const InvoiceReviewDialog = ({
  isOpen,
  setIsOpen,
  transactions,
  onSuccess,
}: InvoiceReviewDialogProps) => {
  const [items, setItems] = useState<ExtractedTransaction[]>(transactions);
  const [isSaving, setIsSaving] = useState(false);

  const handleItemChange = (
    index: number,
    field: keyof ExtractedTransaction,
    value: string | number | TransactionCategory | undefined,
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Filtra para garantir que todas as transações têm uma categoria
    const itemsToSave = items.filter((item) => item.category);

    if (itemsToSave.length !== items.length) {
      toast.error("Por favor, defina uma categoria para todas as despesas.");
      setIsSaving(false);
      return;
    }

    // Converte as datas para objetos Date
    const finalItems = itemsToSave.map((item) => ({
      ...item,
      date: item.date ? new Date(item.date) : new Date(),
    }));

    try {
      await saveExtractedTransactions(finalItems);
      toast.success(
        `${finalItems.length} transações foram adicionadas com sucesso!`,
      );
      onSuccess();
      setIsOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao guardar as transações.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Rever Transações da Fatura</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-4">
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 items-center gap-2 rounded-lg border p-2 md:grid-cols-4"
              >
                <Input
                  value={item.name}
                  onChange={(e) =>
                    handleItemChange(index, "name", e.target.value)
                  }
                  placeholder="Nome da Despesa"
                />
                <Input
                  type="number"
                  value={item.amount}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "amount",
                      parseFloat(e.target.value),
                    )
                  }
                  placeholder="Valor"
                />
                {/* O DatePicker pode ser adicionado aqui se necessário */}
                <Select
                  onValueChange={(value) =>
                    handleItemChange(index, "category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(index)}
                >
                  <TrashIcon className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "A guardar..." : `Adicionar ${items.length} Transações`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceReviewDialog;
