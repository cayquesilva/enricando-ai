import { CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Progress } from "@/app/_components/ui/progress";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { BudgetProgressData } from "@/app/_data/get-dashboard";
import { FormatCurrency } from "@/app/_utils/currency";
import Link from "next/link";
import { Button } from "@/app/_components/ui/button";

interface BudgetsProgressProps {
  budgetsProgress: BudgetProgressData[];
}

const BudgetsProgress = ({ budgetsProgress }: BudgetsProgressProps) => {
  // Mostra apenas os 5 orçamentos mais próximos de serem atingidos ou ultrapassados
  const sortedBudgets = [...budgetsProgress]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  return (
    <ScrollArea className="h-full rounded-md border pb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-bold">Progresso do Orçamento</CardTitle>
        <Button asChild variant="link">
          <Link href="/budgets">Ver todos</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedBudgets.length > 0 ? (
          sortedBudgets.map((budget) => {
            const isOverBudget = budget.spentAmount > budget.budgetAmount;
            return (
              <div key={budget.category} className="space-y-2">
                <div className="flex w-full justify-between">
                  <p className="text-sm font-bold">{budget.categoryLabel}</p>
                  <p
                    className={`text-sm font-bold ${isOverBudget ? "text-red-500" : ""}`}
                  >
                    {FormatCurrency(budget.spentAmount)} /{" "}
                    {FormatCurrency(budget.budgetAmount)}
                  </p>
                </div>
                <Progress
                  value={Math.min(budget.percentage, 100)}
                  className={isOverBudget ? "[&>*]:bg-red-500" : ""}
                />
              </div>
            );
          })
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            <p>Você ainda não definiu nenhum orçamento para este mês.</p>
            <Button asChild className="mt-2">
              <Link href="/budgets" className="text-white">
                Definir Orçamentos
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </ScrollArea>
  );
};

export default BudgetsProgress;
