// ficheiro: app/_actions/auth/logout.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const logoutAction = async () => {
  // ADICIONE ESTA LINHA PARA O TESTE
  console.log(
    "🔴🔴🔴 ALERTA: A FUNÇÃO LOGOUT FOI EXECUTADA! 🔴🔴🔴 HORA:",
    new Date().toISOString(),
  );

  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
  redirect("/login");
};
