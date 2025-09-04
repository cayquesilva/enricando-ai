import Navbar from "../_components/navbar";
import { requireAuth } from "../_lib/auth";
import BudgetsList from "./_components/budgets-list";

const BudgetsPage = async () => {
  const user = await requireAuth();

  return (
    <div className="flex h-screen flex-col">
      <Navbar
        user={{
          name: user.name,
          isPremium: user.isPremium,
          isAdmin: user.isAdmin,
        }}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Meus Orçamentos</h1>
            {/* Futuramente, podemos adicionar filtros de data aqui */}
          </div>
          <p className="mb-6 text-muted-foreground">
            Defina limites de gastos mensais para as suas categorias. Acompanhe
            o seu progresso e mantenha as suas finanças sob controlo.
          </p>
          <BudgetsList />
        </div>
      </main>
    </div>
  );
};

export default BudgetsPage;
