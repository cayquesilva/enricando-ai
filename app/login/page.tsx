import Image from "next/image";
import { getAuthenticatedUser } from "../_lib/auth";
import { redirect } from "next/navigation";
import LogoIcon from "../_components/logo";
import LoginForm from "./_components/login-form";

const LoginPage = async () => {
  const user = await getAuthenticatedUser();
  
  if (user) {
    redirect("/");
  }
  
  return (
    <div className="h-full sm:grid sm:grid-cols-2">
      {/* ESQUERDA */}
      <div className="relative z-[999] mx-auto flex h-full max-w-[550px] flex-col justify-center p-8">
        <LogoIcon />

        <h1 className="mb-3 mt-4 text-4xl font-bold">Bem-vindo</h1>
        <p className="mb-8 text-muted-foreground">
          A Enrica AI é uma plataforma de gestão financeira que utiliza IA para
          monitorar suas movimentações e oferecer insights personalizados,
          facilitando o controle do seu orçamento.
        </p>
        
        <LoginForm />
      </div>

      {/* DIREITA */}
      <div className="z-[-999] opacity-10 sm:relative sm:h-full sm:w-full sm:opacity-100">
        <Image
          src="/login.png"
          alt="Faça login"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
};

export default LoginPage;