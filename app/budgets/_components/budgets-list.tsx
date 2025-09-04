"use client";

import { useEffect, useState } from "react";
import { getBudgetsData } from "@/app/_actions/get-budgets-data";
import { Progress } from "@/app/_components/ui/progress";
import { FormatCurrency } from "@/app/_utils/currency";
import { Input } from "@/app/_components/ui/input";
import { Button } from "@/app/_components/ui/button";
import { SaveIcon } from "lucide-react";
import { upsertBudget } from "@/app/_actions/upsert-budget";
import { toast } from "sonner";
import { TransactionCategory } from "@prisma/client";

type BudgetRowData = {
  category: string;
  categoryLabel: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
};

// Componente para uma única linha da lista
const BudgetRow = ({
  data,
  month,
  year,
}: {
  data: BudgetRowData;
  month: number;
  year: number;
}) => {
  const [amount, setAmount] = useState(data.budgetAmount);
  const [isSaving, setIsSaving] = useState(false);

  const percentage =
    data.budgetAmount > 0 ? (data.spentAmount / data.budgetAmount) * 100 : 0;
  const isOverBudget =
    data.spentAmount > data.budgetAmount && data.budgetAmount > 0;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await upsertBudget({
        category: data.category as TransactionCategory,
        amount,
        month,
        year,
      });
      toast.success(`Orçamento para ${data.categoryLabel} guardado.`);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao guardar o orçamento.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-3">
      <div className="md:col-span-1">
        <h3 className="font-bold">{data.categoryLabel}</h3>
        <p className="text-sm text-muted-foreground">
          Gasto: {FormatCurrency(data.spentAmount)}
        </p>
      </div>
      <div className="space-y-2 md:col-span-2">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Definir orçamento"
          />
          <Button size="icon" onClick={handleSave} disabled={isSaving}>
            <SaveIcon className="h-4 w-4" />
          </Button>
        </div>
        <div>
          <Progress
            value={Math.min(percentage, 100)}
            className={isOverBudget ? "[&>*]:bg-red-500" : ""}
          />
          <p
            className={`mt-1 text-xs ${isOverBudget ? "font-bold text-red-500" : "text-muted-foreground"}`}
          >
            {isOverBudget
              ? `${FormatCurrency(data.spentAmount - data.budgetAmount)} acima do orçamento`
              : `${FormatCurrency(data.remainingAmount)} restantes`}
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente principal da lista
const BudgetsList = () => {
  const [data, setData] = useState<BudgetRowData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const result = await getBudgetsData({ month, year });
      setData(result);
      setIsLoading(false);
    };
    fetchData();
  }, [currentDate]);

  if (isLoading) {
    return <div>A carregar orçamentos...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Adicionar seletor de data aqui no futuro */}
      <h2 className="text-lg font-semibold">
        Orçamentos para{" "}
        {currentDate.toLocaleString("pt-BR", {
          month: "long",
          year: "numeric",
        })}
      </h2>
      {data.map((item) => (
        <BudgetRow
          key={item.category}
          data={item}
          month={currentDate.getMonth() + 1}
          year={currentDate.getFullYear()}
        />
      ))}
    </div>
  );
};

export default BudgetsList;
