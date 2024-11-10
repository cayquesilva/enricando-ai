import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "../_components/navbar";
import SummaryCards from "./_components/summary-cards";
import TimeSelect from "./_components/time-select";
import { isMatch } from "date-fns";
import TransactionsPieChart from "./_components/transactions-pie-chart";
import { getDashboard } from "../_data/get-dashboard";
import ExpensesPerCategory from "./_components/expenses-per-category";
import LastTransactions from "./_components/last-transactions";

interface HomeProps {
  searchParams: {
    month: string;
  };
}

const Home = async ({ searchParams: { month } }: HomeProps) => {
  //contorle de rota com o auth. só abre se tiver logado.
  const { userId } = await auth();

  //caso não esteja logado, redireciona pra login
  if (!userId) {
    redirect("/login");
  }

  //verificando se o mês foi informado e se é válido no formato 01 02 03 etc... "MM"
  const monthIsInvalid = !month || !isMatch(month, "MM");

  //caso nao seja valido, redireciona para o mês padrão 01.
  if (monthIsInvalid) {
    redirect("?month=01");
  }

  //pega os dados por meio de arquivo separado, para nao passar dados sensiveis por client components
  const dashboard = await getDashboard(month);

  return (
    <>
      <Navbar />
      <div className="flex h-full flex-col space-y-2 overflow-hidden p-4">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <TimeSelect />
        </div>
        <div className="grid h-full grid-cols-[2fr,1fr] gap-4 overflow-hidden">
          <div className="flex flex-col gap-4 overflow-hidden">
            <SummaryCards {...dashboard} />
            <div className="grid h-full grid-cols-3 grid-rows-1 gap-4 overflow-hidden">
              <TransactionsPieChart {...dashboard} />
              <ExpensesPerCategory
                expensesPerCategory={dashboard.totalExpensePerCategory}
              />
            </div>
          </div>
          <LastTransactions lastTransactions={dashboard.lastTransactions} />
        </div>
      </div>
    </>
  );
};

export default Home;
