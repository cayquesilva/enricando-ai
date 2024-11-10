import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "../_components/navbar";

const Home = async () => {
  //contorle de rota com o auth. só abre se tiver logado.
  const { userId } = await auth();

  //caso não esteja logado, redireciona pra login
  if (!userId) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      <div className="flex h-full items-center justify-center">
        <UserButton showName />
      </div>
    </>
  );
};

export default Home;
