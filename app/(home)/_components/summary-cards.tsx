import {
  PiggyBankIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";
import SummaryCard from "./summary-card";
import { AuthUser } from "@/app/_lib/auth";

//cria interface para receber como props o month da URL
interface SummaryCards {
  balance: number;
  depositsTotal: number;
  investmentsTotal: number;
  expensesTotal: number;
  user: AuthUser;
}

const SummaryCards = async ({
  balance,
  investmentsTotal,
  depositsTotal,
  expensesTotal,
  user,
}: SummaryCards) => {
  return (
    <div className="space-y-4">
      {/* primeiro card */}

      <SummaryCard
        icon={<WalletIcon size={16} />}
        title="Saldo"
        amount={balance}
        size="large"
        user={user}
      />

      {/* outros cards */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={<TrendingUpIcon size={16} className="text-primary" />}
          title="Receita"
          amount={depositsTotal}
        />

        <SummaryCard
          icon={<TrendingDownIcon size={16} className="text-red-500" />}
          title="Despesa"
          amount={expensesTotal}
        />

        <SummaryCard
          icon={<PiggyBankIcon size={16} />}
          title="Investido"
          amount={investmentsTotal}
        />
      </div>
    </div>
  );
};

export default SummaryCards;
