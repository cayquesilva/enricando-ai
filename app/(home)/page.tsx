import { requireAuth } from "@/app/_lib/auth";
import Navbar from "../_components/navbar";
import SummaryCards from "./_components/summary-cards";
import TimeSelect from "./_components/time-select";
import { isMatch } from "date-fns";
import { redirect } from "next/navigation";
import TransactionsPieChart from "./_components/transactions-pie-chart";
import { getDashboard } from "../_data/get-dashboard";
import ExpensesPerCategory from "./_components/expenses-per-category";
import LastTransactions from "./_components/last-transactions";
import AiReportButton from "./_components/ai-report-button";
import YearSelect from "./_components/year-select";

interface HomeProps {
  searchParams: {
    month?: string;
    year?: string;
  };
}

const Home = async ({ searchParams: { month, year } }: HomeProps) => {
  // Autenticação obrigatória
  const user = await requireAuth();

  // Validação e redirecionamento para data atual se inválida
  const monthIsInvalid = !month || !isMatch(month, "MM");
  const yearIsInvalid = !year || !isMatch(year, "yyyy");

  if (monthIsInvalid || yearIsInvalid) {
    const currentDate = new Date();
    redirect(
      `?month=${String(currentDate.getMonth() + 1).padStart(2, '0')}&year=${currentDate.getFullYear()}`,
    );
  }

  // Buscar dados do dashboard
  const dashboard = await getDashboard(month!, year!, user.id);

  const hasPremiumPlan = user.isPremium;

  return (
    <>
      <Navbar user={user} />
      <div className="flex h-full flex-col space-y-2 p-4 lg:overflow-hidden">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="mb-2 flex gap-6 md:mb-0">
            <AiReportButton
              month={month!}
              year={year!}
              hasPremiumPlan={hasPremiumPlan}
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
            month={month!}
            year={year!}
          />
        </div>
      </div>
    </>
  );
};

export default Home;
