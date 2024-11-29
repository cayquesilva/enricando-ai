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

const TimeSelect = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Atualiza o parâmetro 'month' sem remover outros parâmetros
  const handleMonthChange = (month: string) => {
    const params = new URLSearchParams(searchParams.toString()); // Clona os parâmetros existentes
    params.set("month", month); // Define ou atualiza o parâmetro 'month'
    router.push(`?${params.toString()}`); // Atualiza a URL com os novos parâmetros
  };

  const month = searchParams.get("month");

  return (
    <Select
      defaultValue={month ?? ""}
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
