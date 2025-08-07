"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import { ShieldIcon, CrownIcon, UserIcon } from "lucide-react";
import { toggleUserPremium, toggleUserAdmin } from "../_actions/manage-users";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: Date;
  _count: {
    transactions: number;
  };
};

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "isPremium",
    header: "Premium",
    cell: ({ row: { original: user } }) => (
      <Badge variant={user.isPremium ? "default" : "secondary"}>
        {user.isPremium ? "Premium" : "Gratuito"}
      </Badge>
    ),
  },
  {
    accessorKey: "isAdmin",
    header: "Admin",
    cell: ({ row: { original: user } }) => (
      <Badge variant={user.isAdmin ? "destructive" : "outline"}>
        {user.isAdmin ? "Admin" : "Usuário"}
      </Badge>
    ),
  },
  {
    accessorKey: "_count.transactions",
    header: "Transações",
    cell: ({ row: { original: user } }) => user._count.transactions,
  },
  {
    accessorKey: "createdAt",
    header: "Criado em",
    cell: ({ row: { original: user } }) =>
      new Date(user.createdAt).toLocaleDateString("pt-BR"),
  },
  {
    accessorKey: "actions",
    header: "Ações",
    cell: ({ row: { original: user } }) => {
      const handleTogglePremium = async () => {
        try {
          await toggleUserPremium(user.id);
          toast.success(
            user.isPremium 
              ? "Plano premium removido" 
              : "Plano premium ativado"
          );
          window.location.reload();
        } catch (error) {
          toast.error("Erro ao alterar plano premium");
        }
      };

      const handleToggleAdmin = async () => {
        try {
          await toggleUserAdmin(user.id);
          toast.success(
            user.isAdmin 
              ? "Privilégios de admin removidos" 
              : "Privilégios de admin concedidos"
          );
          window.location.reload();
        } catch (error) {
          toast.error("Erro ao alterar privilégios de admin");
        }
      };

      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTogglePremium}
          >
            <CrownIcon size={16} />
            {user.isPremium ? "Remover Premium" : "Ativar Premium"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleAdmin}
          >
            <ShieldIcon size={16} />
            {user.isAdmin ? "Remover Admin" : "Tornar Admin"}
          </Button>
        </div>
      );
    },
  },
];