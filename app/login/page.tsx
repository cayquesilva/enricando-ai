import Image from "next/image";
import { Button } from "../_components/ui/button";
import { LogInIcon } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const LoginPage = async () => {
  const { userId } = await auth();
  if (userId) {
    redirect("/");
  }
  return (
    <div className="grid h-full grid-cols-2">
      {/* ESQUERDA */}

      <div className="mx-auto flex h-full max-w-[550px] flex-col justify-center p-8">
        <div className="mb-8 flex items-center gap-2">
          <Image src="logo.svg" alt="Enrica Ai" width={39} height={39} />
          <h3 className="text-2xl font-bold text-white">Enrica.AI</h3>
        </div>

        <h1 className="mb-3 text-4xl font-bold">Bem-vindo</h1>
        <p className="text-muted-foreground mb-8">
          A Enrica AI é uma plataforma de gestão financeira que utiliza IA para
          monityorar suas movimentações e oferecer insights personalizados,
          facilitando o controle do seu orçamento
        </p>
        <SignInButton>
          <Button variant={"outline"}>
            <LogInIcon className="mr-2" />
            Fazer Login ou criar conta
          </Button>
        </SignInButton>
      </div>

      {/* DIREITA */}

      <div className="relative h-full w-full">
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
