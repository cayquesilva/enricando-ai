"use client"; // A página agora é um Componente de Cliente

import { useEffect, useState } from "react";
import { Transaction } from "@prisma/client";
import { DataTable } from "../_components/ui/data-table";
import { getTransactionColumns } from "./_columns";
import AddTransactionButton from "../_components/add-transaction-button";
import Navbar from "../_components/navbar";
import { ScrollArea } from "../_components/ui/scroll-area";
import TimeSelect from "../(home)/_components/time-select";
import YearSelect from "../(home)/_components/year-select";
import { getTransactionsPageData } from "../transactions/_actions/get-transactions-page-data";
import UpsertTransactionDialog from "../_components/upsert-transaction-dialog";
import { useSearchParams } from "next/navigation";
import { AuthUser } from "../_lib/auth";

// Como a página agora é de cliente, a busca de dados é feita numa Server Action
// e o resultado é guardado num estado.

const TransactionsPage = () => {
  // Estado para guardar os dados que vêm do servidor
  const [data, setData] = useState<{
    user: AuthUser;
    transactions: Transaction[];
    userCanAddTransaction: boolean;
  } | null>(null);

  // Estados para gerir o diálogo de edição
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    Transaction | undefined
  >(undefined);

  const searchParams = useSearchParams();
  const month =
    searchParams.get("month") ||
    String(new Date().getMonth() + 1).padStart(2, "0");
  const year = searchParams.get("year") || String(new Date().getFullYear());

  // useEffect para buscar os dados sempre que a página carrega ou os filtros de data mudam
  useEffect(() => {
    const fetchData = async () => {
      // Mostra um estado de carregamento enquanto busca novos dados
      setData(null);
      const result = await getTransactionsPageData({ month, year });
      setData(result);
    };
    fetchData();
  }, [month, year]);

  // Função que será chamada pelo botão "Editar" na linha da tabela
  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  // Se os dados ainda não carregaram, mostra uma mensagem de "A carregar..."
  if (!data) {
    // Pode substituir isto por um componente de "loading skeleton" mais elaborado
    return <div className="p-6">A carregar transações...</div>;
  }

  // Desestrutura os dados após o carregamento
  const { user, transactions, userCanAddTransaction } = data;
  // Gera as definições das colunas, passando os dados necessários
  const columns = getTransactionColumns({ month, year, onEdit: handleEdit });

  return (
    <>
      <Navbar
        user={{
          name: user.name,
          isPremium: user.isPremium,
          isAdmin: user.isAdmin,
        }}
      />
      <div className="flex flex-col space-y-6 overflow-hidden p-6">
        <div className="flex w-full flex-col items-center justify-between gap-4 md:flex-row">
          <h1 className="text-2xl font-bold">Transações</h1>
          <div className="flex items-center gap-4">
            <TimeSelect currentMonth={month} />
            <YearSelect currentYear={year} />
            <AddTransactionButton
              userCanAddTransaction={userCanAddTransaction}
            />
          </div>
        </div>
        <ScrollArea className="h-full">
          <DataTable columns={columns} data={transactions} />
        </ScrollArea>
      </div>

      {/* O diálogo de edição agora vive aqui, a nível da página */}
      <UpsertTransactionDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        // Passa a transação selecionada como valor padrão para o formulário
        defaultValues={
          selectedTransaction
            ? {
                ...selectedTransaction,
                amount: Number(selectedTransaction.amount),
              }
            : undefined
        }
        transactionId={selectedTransaction?.id}
      />
    </>
  );
};

export default TransactionsPage;
