"use client";

import { ArrowDownUpIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import UpsertTransactionDialog from "./upsert-transaction-dialog";
import { AuthUser } from "../_lib/auth";
import { canUserAddTransaction } from "../_data/can-user-add-transaction";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

//client component não pode acessar banco, por isso receberá a informação de um server component via PROPS
interface AddTransactionButtonProps {
  user: AuthUser;
}

const AddTransactionButton = ({
  user,
}: AddTransactionButtonProps) => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [userCanAddTransaction, setUserCanAddTransaction] = useState<boolean | null>(null);

  // Verificar se pode adicionar transação quando o componente monta
  React.useEffect(() => {
    const checkCanAdd = async () => {
      const canAdd = await canUserAddTransaction(user.id, user.isPremium);
      setUserCanAddTransaction(canAdd);
    };
    checkCanAdd();
  }, [user.id, user.isPremium]);

  if (userCanAddTransaction === null) {
    return (
      <Button className="rounded-full font-bold" disabled>
        Carregando...
        <ArrowDownUpIcon />
      </Button>
    );
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="rounded-full font-bold"
              onClick={() => setDialogIsOpen(true)}
              disabled={!userCanAddTransaction}
            >
              Adicionar transação
              <ArrowDownUpIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {!userCanAddTransaction &&
              "Você atingiu o limite de transações. Atualize seu plano para cadastrar transações ilimitadas"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <UpsertTransactionDialog
        setIsOpen={setDialogIsOpen}
        isOpen={dialogIsOpen}
      />
    </>
  );
};

export default AddTransactionButton;
