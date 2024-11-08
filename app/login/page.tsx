import Image from "next/image";
import { Button } from "../_components/ui/button";
import { LogInIcon } from "lucide-react";

const LoginPage = () => {
  return (
    <div className="grid h-full grid-cols-2">
      {/* ESQUERDA */}

      <div className="mx-auto flex h-full max-w-[550px] flex-col justify-center p-8">
        <div className="flex items-center gap-2 mb-8">
          <Image src="logo.svg" alt="Enrica Ai" width={39} height={39} />
          <h3 className="text-white font-bold text-2xl">Enrica.AI</h3>
        </div>

        <h1 className="text-4xl font-bold mb-3">Bem-vindo</h1>
        <p className="text-muted-foreground mb-8">
          A Enrica AI é uma plataforma de gestão financeira que utiliza IA para
          monityorar suas movimentações e oferecer insights personalizados,
          facilitando o controle do seu orçamento
        </p>
        <Button variant={"outline"}>
            <LogInIcon className="mr-2"/>
            Fazer Login ou criar conta
        </Button>
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
