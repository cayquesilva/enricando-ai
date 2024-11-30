import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "../_components/navbar";
import SummaryCards from "./_components/summary-cards";
import TimeSelect from "./_components/time-select";
import { isMatch } from "date-fns";
import TransactionsPieChart from "./_components/transactions-pie-chart";
import { getDashboard } from "../_data/get-dashboard";
import ExpensesPerCategory from "./_components/expenses-per-category";
import LastTransactions from "./_components/last-transactions";
import AiReportButton from "./_components/ai-report-button";
import YearSelect from "./_components/year-select";

interface HomeProps {
  searchParams: {
    month: string;
    year: string;
  };
}

const Home = async ({ searchParams: { month, year } }: HomeProps) => {
  //contorle de rota com o auth. só abre se tiver logado.
  const { userId } = await auth();

  //caso não esteja logado, redireciona pra login
  if (!userId) {
    redirect("/login");
  }

  //verificando se o mês e ano foi informado e se é válido no formato 01 02 03 etc... "MM" ou 2024 2025 "YYYY"
  const monthIsInvalid = !month || !isMatch(month, "MM");
  const yearIsInvalid = !year || !isMatch(year, "yyyy");

  //caso nao seja valido, redireciona para o mês atual.
  if (monthIsInvalid && yearIsInvalid) {
    redirect(
      `?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`,
    );
  }

  //pega os dados por meio de arquivo separado, para nao passar dados sensiveis por client components
  const dashboard = await getDashboard(month, year);

  //pegar o user do clerk
  const user = await clerkClient().users.getUser(userId);

  return (
    <>
      <Navbar />
      <div className="flex h-full flex-col space-y-2 p-4 lg:overflow-hidden">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="mb-2 flex gap-6 md:mb-0">
            <AiReportButton
              month={month}
              year={year}
              hasPremiumPlan={
                user.publicMetadata.subscriptionPlan === "premium"
              }
            />
            <TimeSelect />
            <YearSelect />
          </div>
        </div>
        <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-[2fr,1fr] lg:overflow-hidden">
          <div className="flex h-full flex-col gap-4 lg:overflow-hidden">
            <SummaryCards {...dashboard} />
            <div className="flex h-full w-full flex-col gap-4 md:grid-rows-1 lg:grid lg:grid-cols-3 lg:overflow-hidden">
              <TransactionsPieChart {...dashboard} />
              <ExpensesPerCategory
                expensesPerCategory={dashboard.totalExpensePerCategory}
              />
            </div>
          </div>
          <LastTransactions
            lastTransactions={dashboard.lastTransactions}
            month={month}
            year={year}
          />
        </div>
      </div>
    </>
  );
};

export default Home;
