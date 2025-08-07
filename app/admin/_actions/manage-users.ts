"use server";

import { db } from "@/app/_lib/prisma";
import { requireAdmin } from "@/app/_lib/auth";
import { ERROR_MESSAGES } from "@/app/_lib/constants";
import { revalidatePath } from "next/cache";

export const toggleUserPremium = async (userId: string) => {
  // Verificar se é admin
  await requireAdmin();

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  await db.user.update({
    where: { id: userId },
    data: {
      isPremium: !user.isPremium,
    },
  });

  revalidatePath("/admin");
};

export const toggleUserAdmin = async (userId: string) => {
  // Verificar se é admin
  const currentUser = await requireAdmin();

  // Não permitir que o usuário remova seus próprios privilégios de admin
  if (currentUser.id === userId) {
    throw new Error("Você não pode remover seus próprios privilégios de admin");
  }

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  await db.user.update({
    where: { id: userId },
    data: {
      isAdmin: !user.isAdmin,
    },
  });

  revalidatePath("/admin");
};