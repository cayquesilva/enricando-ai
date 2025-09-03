import { requireAuth } from "@/app/_lib/auth";
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
import { canUserAddTransaction } from "../_data/can-user-add-transaction";
import HistoricalChart from "./_components/historical-chart"; // Importe o novo componente

interface HomeProps {
  searchParams: {
    month?: string;
    year?: string;
  };
}

const Home = async ({ searchParams }: HomeProps) => {
  // Autenticação obrigatória
  const user = await requireAuth();

  // Validação e redirecionamento para data atual se inválida
  let month = searchParams.month;
  let year = searchParams.year;

  if (!month || !isMatch(month, "MM")) {
    month = String(new Date().getMonth() + 1).padStart(2, "0");
  }

  if (!year || !isMatch(year, "yyyy")) {
    year = String(new Date().getFullYear());
  }

  // Adicione a verificação aqui, no servidor
  const userCanAddTransaction = await canUserAddTransaction(
    user.id,
    user.isPremium,
    month,
    year,
  );

  // Buscar dados do dashboard
  const dashboard = await getDashboard(month!, year!, user);

  const hasPremiumPlan = user.isPremium;

  return (
    <>
      <Navbar
        user={{
          name: user.name,
          isPremium: user.isPremium,
          isAdmin: user.isAdmin,
        }}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {" "}
          {/* Um container para gerir o espaçamento interno */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="mb-2 flex flex-wrap justify-center gap-4 md:mb-0 md:gap-6">
              <AiReportButton
                month={month}
                year={year}
                hasPremiumPlan={hasPremiumPlan}
              />
              <TimeSelect currentMonth={month} />
              <YearSelect currentYear={year} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr,1fr]">
            <div className="flex flex-col gap-4">
              <SummaryCards
                {...dashboard}
                userCanAddTransaction={userCanAddTransaction}
              />
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="xl:col-span-1">
                  <TransactionsPieChart {...dashboard} />
                </div>
                <div className="xl:col-span-2">
                  <ExpensesPerCategory
                    expensesPerCategory={dashboard.totalExpensePerCategory}
                  />
                </div>
              </div>
              <div>
                <HistoricalChart />
              </div>
            </div>

            <LastTransactions
              lastTransactions={dashboard.lastTransactions}
              month={month}
              year={year}
            />
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
