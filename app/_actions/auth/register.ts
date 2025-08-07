"use server";

import { db } from "@/app/_lib/prisma";
import { generateToken } from "@/app/_lib/auth";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/app/_lib/constants";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const registerAction = async (formData: FormData) => {
  try {
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const validatedData = registerSchema.parse(data);

    // Verificar se email já existe
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Criar usuário
    const user = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      },
    });

    // Gerar token e fazer login automático
    const token = generateToken(user.id);
    const cookieStore = await cookies();
    
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    redirect("/");
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw error;
  }
};