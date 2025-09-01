"use server";

import { db } from "@/app/_lib/prisma";
import { generateToken } from "@/app/_lib/auth";
import { ERROR_MESSAGES } from "@/app/_lib/constants";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type FormState = { error: string } | undefined;

export const loginAction = async (
  prevState: FormState,
  formData: FormData,
): Promise<FormState> => {
  try {
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const validatedData = loginSchema.parse(data);

    const user = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return { error: ERROR_MESSAGES.INVALID_CREDENTIALS };
    }

    const isValidPassword = await bcrypt.compare(
      validatedData.password,
      user.password,
    );

    if (!isValidPassword) {
      return { error: ERROR_MESSAGES.INVALID_CREDENTIALS };
    }

    // Se a autenticação foi bem-sucedida, definimos o cookie
    const token = generateToken(user.id);
    cookies().set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
  } catch (error) {
    // O catch agora só lida com erros de validação ou do banco de dados
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Ocorreu um erro inesperado." };
  }

  // O redirect é chamado aqui, fora do try...catch
  redirect("/");
};
