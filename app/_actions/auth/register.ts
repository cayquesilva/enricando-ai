"use server";

import { db } from "@/app/_lib/prisma";
import { generateToken } from "@/app/_lib/auth";
import { ERROR_MESSAGES } from "@/app/_lib/constants";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type FormState = { error: string } | undefined;

export const registerAction = async (
  prevState: FormState,
  formData: FormData,
): Promise<FormState> => {
  try {
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const validatedData = registerSchema.parse(data);

    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return { error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS };
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    const user = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      },
    });

    const token = generateToken(user.id);
    cookies().set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
  } catch (error) {
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
