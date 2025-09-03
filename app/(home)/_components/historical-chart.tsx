"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { getHistoricalData } from "@/app/_actions/get-historical-data";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FormatCurrency } from "@/app/_utils/currency";

type ChartData = {
  month: string;
  income: number;
  expenses: number;
};

const HistoricalChart = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const result = await getHistoricalData();
      setData(result);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle>Histórico Financeiro (12 Meses)</CardTitle>
        </CardHeader>
        <CardContent className="flex h-full items-center justify-center">
          <p>A carregar dados do gráfico...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico Financeiro (12 Meses)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke="#888888" fontSize={12} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickFormatter={(value) => FormatCurrency(value)}
            />
            <Tooltip
              formatter={(value: number) => FormatCurrency(value)}
              cursor={{ fill: "rgba(142, 142, 142, 0.1)" }}
            />
            <Legend />
            <Bar
              dataKey="income"
              name="Receita"
              fill="#55B02E"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expenses"
              name="Despesa"
              fill="#E93030"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default HistoricalChart;
