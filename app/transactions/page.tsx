"use client";

import { useEffect, useState, useCallback } from "react";
import { Transaction as PrismaTransaction } from "@prisma/client";
import { DataTable } from "../_components/ui/data-table";
import { getTransactionColumns } from "./_columns";
import AddTransactionButton from "../_components/add-transaction-button";
import Navbar from "../_components/navbar";
import TimeSelect from "../(home)/_components/time-select";
import YearSelect from "../(home)/_components/year-select";
import UpsertTransactionDialog from "../_components/upsert-transaction-dialog";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AuthUser } from "../_lib/auth";
import SummaryCard from "../(home)/_components/summary-card";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { Input } from "../_components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../_components/ui/select";
import { TRANSACTION_CATEGORY_OPTIONS } from "../_constants/transactions";
import { getTransactionsPageData } from "./_actions/get-transactions-page-data";
import ReceiptScanner from "../_components/receipt-scanner";
import { ParsedReceiptData } from "../_lib/ocr-parser";

type Transaction = Omit<PrismaTransaction, "amount"> & { amount: number };

type PageData = {
  user: AuthUser;
  transactions: Transaction[];
  userCanAddTransaction: boolean;
  totalIncome: number;
  totalExpenses: number;
};

type DialogState = {
  isOpen: boolean;
  defaultValues?: Partial<Transaction>;
  transactionId?: string;
};

const TransactionsPage = () => {
  const [data, setData] = useState<PageData | null>(null);
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
  });
  const [isFetching, setIsFetching] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const month =
    searchParams.get("month") ||
    String(new Date().getMonth() + 1).padStart(2, "0");
  const year = searchParams.get("year") || String(new Date().getFullYear());
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  const [inputValue, setInputValue] = useState(search);

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  // A função fetchData agora apenas busca os dados, sem alterar o estado diretamente
  const fetchData = useCallback(async () => {
    setIsFetching(true);
    try {
      const result = await getTransactionsPageData({
        month,
        year,
        search,
        category,
      });
      setData(result as PageData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setData(null); // Em caso de erro, define data como nulo
    } finally {
      setIsFetching(false);
    }
  }, [month, year, search, category]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange("search", inputValue);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [inputValue, handleFilterChange]);

  const handleEdit = (transaction: Transaction) => {
    setDialogState({
      isOpen: true,
      defaultValues: transaction,
      transactionId: transaction.id,
    });
  };

  const handleDataExtracted = (extractedData: ParsedReceiptData) => {
    setDialogState({
      isOpen: true,
      defaultValues: extractedData,
      transactionId: undefined,
    });
  };

  // --- LÓGICA DE RENDERIZAÇÃO CORRIGIDA ---
  // 1. Se não houver dados E não estiver a carregar (ex: um erro ocorreu), mostre uma mensagem de erro.
  if (!data && !isFetching) {
    return (
      <div className="p-6">
        Ocorreu um erro ao carregar os dados. Tente novamente.
      </div>
    );
  }

  // 2. Se não houver dados (ou seja, está no carregamento inicial), mostre a Navbar e o ecrã de carregamento.
  // Isto evita o crash, pois o resto do componente não tenta aceder a 'data'.
  if (!data) {
    return (
      <div className="flex h-screen flex-col">
        {/* Renderiza uma Navbar "vazia" ou um placeholder se 'user' for necessário */}
        <div className="p-6">A carregar página...</div>
      </div>
    );
  }

  // A partir daqui, temos a certeza de que 'data' existe
  const {
    user,
    transactions,
    userCanAddTransaction,
    totalIncome,
    totalExpenses,
  } = data;
  const columns = getTransactionColumns({
    month,
    year,
    onEdit: handleEdit,
    onSuccess: fetchData,
  });

  return (
    <div className="flex flex-col">
      <Navbar
        user={{
          name: user.name,
          isPremium: user.isPremium,
          isAdmin: user.isAdmin,
        }}
      />
      <div className="flex flex-1 flex-col space-y-4 overflow-y-auto p-6">
        <div className="flex w-full flex-col items-center justify-between gap-4 md:flex-row">
          <h1 className="text-2xl font-bold">Transações</h1>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SummaryCard
            icon={<TrendingUpIcon size={16} className="text-primary" />}
            title="Receita do Mês (filtrada)"
            amount={totalIncome}
          />
          <SummaryCard
            icon={<TrendingDownIcon size={16} className="text-red-500" />}
            title="Despesa do Mês (filtrada)"
            amount={totalExpenses}
          />
        </div>
        <div className="flex w-full flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
            <Input
              placeholder="Pesquisar por nome..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full md:max-w-xs"
            />
            <Select
              defaultValue={category}
              onValueChange={(value) => {
                const filterValue = value === "all" ? "" : value;
                handleFilterChange("category", filterValue);
              }}
            >
              <SelectTrigger className="w-full md:max-w-xs">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {TRANSACTION_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
            <TimeSelect currentMonth={month} />
            <YearSelect currentYear={year} />
            <ReceiptScanner onDataExtracted={handleDataExtracted} />

            <AddTransactionButton
              userCanAddTransaction={userCanAddTransaction}
            />
          </div>
        </div>

        {/* 3. A área da tabela agora está dentro de um container flex que a expande */}
        <div className="flex-1 overflow-auto">
          {isFetching ? (
            <div className="flex h-full items-center justify-center">
              <p>A atualizar tabela...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={transactions} />
          )}
        </div>
      </div>

      <UpsertTransactionDialog
        isOpen={dialogState.isOpen}
        setIsOpen={(isOpen) => setDialogState({ ...dialogState, isOpen })}
        defaultValues={dialogState.defaultValues}
        transactionId={dialogState.transactionId}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default TransactionsPage;
