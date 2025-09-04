"use client";

import { Pie, PieChart } from "recharts";

import { Card, CardContent } from "@/app/_components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/_components/ui/chart";
import { TransactionType } from "@prisma/client";
import { TransactionpercentagePerType } from "@/app/_data/get-dashboard/types";
import { PiggyBankIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import PercentageItem from "./percentage-item";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { useMediaQuery } from "@/app/hook/use-media-query";

const chartConfig = {
  [TransactionType.INVESTMENT]: {
    label: "Investido",
    color: "#FFFFFF",
  },
  [TransactionType.DEPOSIT]: {
    label: "Receita",
    color: "#55B02E",
  },
  [TransactionType.EXPENSE]: {
    label: "Despesas",
    color: "#E93030",
  },
} satisfies ChartConfig;

interface TransactionsPieChartProps {
  typesPercentage: TransactionpercentagePerType;
  depositsTotal: number;
  expensesTotal: number;
  investmentsTotal: number;
}

const TransactionsPieChart = ({
  depositsTotal,
  expensesTotal,
  investmentsTotal,
  typesPercentage,
}: TransactionsPieChartProps) => {
  const chartData = [
    {
      type: TransactionType.DEPOSIT,
      amount: depositsTotal,
      fill: "#55B02E",
    },
    {
      type: TransactionType.EXPENSE,
      amount: expensesTotal,
      fill: "#E93030",
    },
    {
      type: TransactionType.INVESTMENT,
      amount: investmentsTotal,
      fill: "#FFFFFF",
    },
  ];

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <>
      {isDesktop ? (
        <ScrollArea className="col-span-2 h-full lg:col-span-1">
          <Card className="flex h-full min-w-[150px] flex-col p-6">
            <CardContent className="flex-1">
              <h1 className="text-center text-2xl font-bold">Movimentações</h1>
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={chartData}
                    dataKey="amount"
                    nameKey="type"
                    innerRadius={60}
                  />
                </PieChart>
              </ChartContainer>
              <div className="space-y-2">
                <PercentageItem
                  icon={<TrendingUpIcon size={16} className="text-primary" />}
                  title="Receita"
                  value={
                    typesPercentage[TransactionType.DEPOSIT] > 0
                      ? typesPercentage[TransactionType.DEPOSIT]
                      : 0
                  }
                />
                <PercentageItem
                  icon={<TrendingDownIcon size={16} className="text-red-500" />}
                  title="Despesa"
                  value={
                    typesPercentage[TransactionType.EXPENSE] > 0
                      ? typesPercentage[TransactionType.EXPENSE]
                      : 0
                  }
                />
                <PercentageItem
                  icon={<PiggyBankIcon size={16} />}
                  title="Investimento"
                  value={
                    typesPercentage[TransactionType.INVESTMENT] > 0
                      ? typesPercentage[TransactionType.INVESTMENT]
                      : 0
                  }
                />
              </div>
            </CardContent>
          </Card>
        </ScrollArea>
      ) : (
        <Card className="flex h-full flex-col p-6">
          <CardContent className="flex-1">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="amount"
                  nameKey="type"
                  innerRadius={60}
                />
              </PieChart>
            </ChartContainer>
            <div className="space-y-2">
              <PercentageItem
                icon={<TrendingUpIcon size={16} className="text-primary" />}
                title="Receita"
                value={
                  typesPercentage[TransactionType.DEPOSIT] > 0
                    ? typesPercentage[TransactionType.DEPOSIT]
                    : 0
                }
              />
              <PercentageItem
                icon={<TrendingDownIcon size={16} className="text-red-500" />}
                title="Despesa"
                value={
                  typesPercentage[TransactionType.EXPENSE] > 0
                    ? typesPercentage[TransactionType.EXPENSE]
                    : 0
                }
              />
              <PercentageItem
                icon={<PiggyBankIcon size={16} />}
                title="Investimento"
                value={
                  typesPercentage[TransactionType.INVESTMENT] > 0
                    ? typesPercentage[TransactionType.INVESTMENT]
                    : 0
                }
              />
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default TransactionsPieChart;
