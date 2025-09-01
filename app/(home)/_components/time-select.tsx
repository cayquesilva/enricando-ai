"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

const MONTH_OPTIONS = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

const TimeSelect = ({ currentMonth }: { currentMonth: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Atualiza o parâmetro 'month' sem remover outros parâmetros
  const handleMonthChange = (month: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", month);
    // Preserva o parâmetro 'year' se ele existir
    if (!params.has("year")) {
      params.set("year", new Date().getFullYear().toString());
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <Select
      defaultValue={currentMonth}
      onValueChange={(value) => {
        handleMonthChange(value);
      }}
    >
      <SelectTrigger className="w-[150px] rounded-full">
        <SelectValue placeholder="Mês" />
      </SelectTrigger>
      <SelectContent>
        {MONTH_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TimeSelect;
