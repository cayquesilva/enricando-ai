"use server";

import { db } from "@/app/_lib/prisma";
import { generateToken } from "@/app/_lib/auth";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/app/_lib/constants";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const loginAction = async (formData: FormData) => {
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
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const isValidPassword = await bcrypt.compare(validatedData.password, user.password);

    if (!isValidPassword) {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

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