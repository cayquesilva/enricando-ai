import { requireAdmin } from "../_lib/auth";
import Navbar from "../_components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "../_components/ui/card";
import { ScrollArea } from "../_components/ui/scroll-area";
import { DataTable } from "../_components/ui/data-table";
import { userColumns } from "./_columns";
import { db } from "../_lib/prisma";

const AdminPage = async () => {
  // Autenticação de admin obrigatória
  const user = await requireAdmin();

  // Buscar todos os usuários
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isPremium: true,
      isAdmin: true,
      createdAt: true,
      _count: {
        select: {
          transactions: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Estatísticas gerais
  const stats = {
    totalUsers: users.length,
    premiumUsers: users.filter(u => u.isPremium).length,
    adminUsers: users.filter(u => u.isAdmin).length,
    totalTransactions: await db.transaction.count(),
  };

  return (
    <>
      <Navbar user={user} />
      <div className="flex flex-col space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.premiumUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.adminUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <DataTable
                columns={userColumns}
                data={JSON.parse(JSON.stringify(users))}
              />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminPage;