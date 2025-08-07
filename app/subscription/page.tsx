import { requireAuth } from "../_lib/auth";
import Navbar from "../_components/navbar";
import { Card, CardContent, CardHeader } from "../_components/ui/card";
import { CheckIcon, XIcon } from "lucide-react";
import { Badge } from "../_components/ui/badge";
import { getCurrentMonthTransactions } from "../_data/get-current-month-transactions";

const SubscriptionsPage = async () => {
  // Autenticação obrigatória
  const user = await requireAuth();

  const hasPremiumPlan = user.isPremium;

  // Contar transações do mês atual
  const currentMonthTransactions = await getCurrentMonthTransactions(user.id);

  return (
    <>
      <Navbar user={user} />
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Assinatura</h1>

        <div className="flex flex-wrap justify-center gap-6 lg:flex-nowrap lg:justify-normal">
          <Card className="w-[450px]">
            <CardHeader className="border-b border-solid py-8">
              <h2 className="text-center text-2xl font-semibold">
                Plano Básico
              </h2>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl">R$</span>
                <span className="text-6xl font-semibold">0</span>
                <span className="text-2xl text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 py-8">
              <div className="flex items-center gap-2">
                <CheckIcon className="text-primary" />
                <p>
                  Apenas 10 transações por mês ({currentMonthTransactions}/
                  <span className="font-bold text-primary">10</span>)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <XIcon />
                <p>Relatórios de IA</p>
              </div>
            </CardContent>
          </Card>

          <Card className="w-[450px]">
            <CardHeader className="relative border-b border-solid py-8">
              {hasPremiumPlan && (
                <Badge className="absolute left-4 top-10 bg-primary/10 text-base text-primary">
                  Ativo
                </Badge>
              )}
              <h2 className="text-center text-2xl font-semibold">
                Plano Premium
              </h2>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl">R$</span>
                <span className="text-6xl font-semibold">19</span>
                <span className="text-2xl text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 py-8">
              <div className="flex items-center gap-2">
                <CheckIcon className="text-primary" />
                <p>Transações ilimitadas</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-primary" />
                <p>Relatórios de IA</p>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Entre em contato com o administrador para ativar o plano premium
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SubscriptionsPage;
