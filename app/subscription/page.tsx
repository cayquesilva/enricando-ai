import { auth } from "@clerk/nextjs/server";
import Navbar from "../_components/navbar";
import { redirect } from "next/navigation";

const SubscriptionsPage = async () => {
  //contorle de rota com o auth. só abre se tiver logado.
  const { userId } = await auth();

  //caso não esteja logado, redireciona pra login
  if (!userId) {
    redirect("/login");
  }

  return <Navbar />;
};

export default SubscriptionsPage;
