"use client";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { loginAction } from "@/app/_actions/auth/login";
import { registerAction } from "@/app/_actions/auth/register";
import { useState } from "react";
import { toast } from "sonner";
import { LogInIcon, UserPlusIcon } from "lucide-react";

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsLoading(true);
      
      if (isLogin) {
        await loginAction(formData);
      } else {
        await registerAction(formData);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form action={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Seu nome completo"
              required
              disabled={isLoading}
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
            disabled={isLoading}
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
            disabled={isLoading}
            minLength={6}
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLogin ? (
            <>
              <LogInIcon className="mr-2" />
              {isLoading ? "Entrando..." : "Entrar"}
            </>
          ) : (
            <>
              <UserPlusIcon className="mr-2" />
              {isLoading ? "Criando conta..." : "Criar conta"}
            </>
          )}
        </Button>
      </form>
      
      <div className="text-center">
        <Button
          variant="link"
          onClick={() => setIsLogin(!isLogin)}
          disabled={isLoading}
        >
          {isLogin 
            ? "Não tem uma conta? Criar conta" 
            : "Já tem uma conta? Fazer login"
          }
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;