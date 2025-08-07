import AddTransactionButton from "@/app/_components/add-transaction-button";
import { Card, CardContent, CardHeader } from "@/app/_components/ui/card";
import { AuthUser } from "@/app/_lib/auth";
import { ReactNode } from "react";

//sempre que for receber algo como prop, tem que criar interface
interface SummaryCardProps {
  icon: ReactNode;
  title: string;
  amount: number;
  size?: "small" | "large";
  user?: AuthUser;
}

const SummaryCard = async ({
  icon,
  title,
  amount,
  size = "small",
  user,
}: SummaryCardProps) => {

  return (
    <Card className={`${size === "large" ? "bg-white bg-opacity-5" : ""}`}>
      <CardHeader className="flex-row items-center gap-2">
        {icon}
        <p
          className={`${size === "small" ? "text-muted-foreground" : "text-white opacity-70"}`}
        >
          {title}
        </p>
      </CardHeader>
      <CardContent
        className={`flex flex-col items-center justify-center gap-2 ${size === "large" ? "sm:flex-row sm:justify-between sm:gap-4" : ""}`}
      >
        <p className={`font-bold ${size === "small" ? "text-lg" : "text-2xl"}`}>
          {Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(amount)}
        </p>

        {/* Caso o componente seja do grande, vai renderizar o botão */}
        {size === "large" && (
          <AddTransactionButton user={user!} />
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
