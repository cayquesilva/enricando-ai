import Image from "next/image";
import { Button } from "../_components/ui/button";
import { LogInIcon } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import LogoIcon from "../_components/logo";

const LoginPage = async () => {
  const { userId } = await auth();
  if (userId) {
    redirect("/");
  }
  return (
    <div className="h-full sm:grid sm:grid-cols-2">
      {/* ESQUERDA */}

      <div className="mx-auto flex h-full max-w-[550px] flex-col justify-center p-8">
        <LogoIcon />

        <h1 className="mb-3 mt-4 text-4xl font-bold">Bem-vindo</h1>
        <p className="mb-8 text-muted-foreground">
          A Enrica AI é uma plataforma de gestão financeira que utiliza IA para
          monitorar suas movimentações e oferecer insights personalizados,
          facilitando o controle do seu orçamento.
        </p>
        <SignInButton>
          <Button variant={"outline"}>
            <LogInIcon className="mr-2" />
            Fazer Login ou Criar Conta
          </Button>
        </SignInButton>
      </div>

      {/* DIREITA */}

      <div className="opacity-10 sm:relative sm:h-full sm:w-full sm:opacity-100">
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
