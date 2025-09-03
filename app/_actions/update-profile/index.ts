"use server";

import { z } from "zod";
import { requireAuth } from "../../_lib/auth";
import { db } from "../../_lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// Schema para validação dos dados do formulário
const profileSchema = z
  .object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(6, "A nova senha deve ter pelo menos 6 caracteres.")
      .optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // Se a nova password for preenchida, a confirmação também deve ser.
      if (data.newPassword && !data.confirmPassword) return false;
      // E ambas devem ser iguais.
      return data.newPassword === data.confirmPassword;
    },
    {
      message: "As novas senhas não correspondem.",
      path: ["confirmPassword"],
    },
  )
  .refine(
    (data) => {
      // Se a nova password for preenchida, a password atual é obrigatória.
      if (data.newPassword && !data.currentPassword) return false;
      return true;
    },
    {
      message: "A senha atual é obrigatória para definir uma nova.",
      path: ["currentPassword"],
    },
  );

type ProfileFormState = {
  message?: string;
  error?: string;
} | null;

export const updateProfile = async (
  prevState: ProfileFormState,
  formData: FormData,
): Promise<{ message?: string; error?: string }> => {
  const user = await requireAuth();

  const validatedFields = profileSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors.map((e) => e.message).join(", "),
    };
  }

  const { name, currentPassword, newPassword } = validatedFields.data;

  try {
    // Atualizar o nome
    if (name !== user.name) {
      await db.user.update({
        where: { id: user.id },
        data: { name },
      });
    }

    // Atualizar a password
    if (newPassword && currentPassword) {
      const currentUser = await db.user.findUnique({ where: { id: user.id } });

      const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        currentUser!.password,
      );

      if (!isPasswordCorrect) {
        return { error: "A senha atual está incorreta." };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
    }

    revalidatePath("/profile");
    revalidatePath("/"); // Para atualizar o nome na Navbar

    return { message: "Perfil atualizado com sucesso!" };
  } catch (error) {
    console.error("Erro ao atualizar o perfil:", error);
    return { error: "Ocorreu um erro ao atualizar o perfil." };
  }
};
