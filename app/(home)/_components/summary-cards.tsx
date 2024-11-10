import {
  PiggyBankIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";
import SummaryCard from "./summary-card";

const SummaryCards = () => {
  return (
    <div className="space-y-6">
      {/* primeiro card */}

      <SummaryCard
        icon={<WalletIcon size={16} />}
        title="Saldo"
        amount={2700}
        size="large"
      />

      {/* outros cards */}

      <div className="grid grid-cols-3 gap-6">
        <SummaryCard
          icon={<PiggyBankIcon size={16} />}
          title="Investido"
          amount={3500}
        />

        <SummaryCard
          icon={<TrendingUpIcon size={16} className="text-primary" />}
          title="Receita"
          amount={4500}
        />

        <SummaryCard
          icon={<TrendingDownIcon size={16} className="text-red-500" />}
          title="Despesa"
          amount={1500}
        />
      </div>
    </div>
  );
};

export default SummaryCards;
