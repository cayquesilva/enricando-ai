import { auth } from "@clerk/nextjs/server";
import Navbar from "../_components/navbar";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "../_components/ui/card";
import { CheckIcon, XIcon } from "lucide-react";
import { Button } from "../_components/ui/button";

const SubscriptionsPage = async () => {
  //contorle de rota com o auth. só abre se tiver logado.
  const { userId } = await auth();

  //caso não esteja logado, redireciona pra login
  if (!userId) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Assinatura</h1>

        <div className="flex gap-6">
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
                <p>Apenas 10 transações por mês (7/10)</p>
              </div>
              <div className="flex items-center gap-2">
                <XIcon />
                <p>Relatórios de IA</p>
              </div>
            </CardContent>
          </Card>

          <Card className="w-[450px]">
            <CardHeader className="border-b border-solid py-8">
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
                <CheckIcon />
                <p>Relatórios de IA</p>
              </div>
              <Button className="w-full rounded-full font-bold">
                Adquirir plano
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SubscriptionsPage;
