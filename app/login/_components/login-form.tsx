"use client";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { loginAction } from "@/app/_actions/auth/login";
import { registerAction } from "@/app/_actions/auth/register";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { LogInIcon, UserPlusIcon } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";

// Componente interno para o botão de submit.
// Ele usa o hook `useFormStatus` para saber quando o formulário está sendo enviado.
const SubmitButton = ({ isLogin }: { isLogin: boolean }) => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {isLogin ? (
        <>
          <LogInIcon className="mr-2" />
          {pending ? "Entrando..." : "Entrar"}
        </>
      ) : (
        <>
          <UserPlusIcon className="mr-2" />
          {pending ? "Criando conta..." : "Criar conta"}
        </>
      )}
    </Button>
  );
};

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);

  // Hook `useFormState` para gerenciar o estado do formulário e os erros da action.
  const [loginState, loginFormAction] = useFormState(loginAction, undefined);
  const [registerState, registerFormAction] = useFormState(
    registerAction,
    undefined,
  );

  // `useEffect` para exibir um toast de erro quando a action retornar um.
  useEffect(() => {
    if (loginState?.error) {
      toast.error(loginState.error);
    }
    if (registerState?.error) {
      toast.error(registerState.error);
    }
  }, [loginState, registerState]);

  return (
    <div className="space-y-6">
      <form
        action={isLogin ? loginFormAction : registerFormAction}
        className="space-y-4"
      >
        {!isLogin && (
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Seu nome completo"
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="seu@email.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Sua senha"
            required
            minLength={6}
          />
        </div>

        <SubmitButton isLogin={isLogin} />
      </form>

      <div className="text-center">
        <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
          {isLogin
            ? "Não tem uma conta? Criar conta"
            : "Já tem uma conta? Fazer login"}
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;
