"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

const YEAR_OPTIONS = [
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
];

const YearSelect = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Atualiza o parâmetro 'year' sem remover os outros parâmetros
  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams.toString()); // Clona os parâmetros existentes
    params.set("year", year); // Define ou atualiza o parâmetro 'year'
    router.push(`?${params.toString()}`); // Atualiza a URL com os novos parâmetros
  };

  const year = searchParams.get("year");

  return (
    <Select
      defaultValue={year ?? ""}
      onValueChange={(value) => {
        handleYearChange(value);
      }}
    >
      <SelectTrigger className="w-[150px] rounded-full">
        <SelectValue placeholder="Ano" />
      </SelectTrigger>
      <SelectContent>
        {YEAR_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default YearSelect;
