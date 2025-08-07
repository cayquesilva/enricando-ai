import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "./prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  isAdmin: boolean;
}

export const getAuthenticatedUser = async (): Promise<AuthUser | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        isPremium: true,
        isAdmin: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
};

export const requireAuth = async (): Promise<AuthUser> => {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    redirect("/login");
  }
  
  return user;
};

export const requireAdmin = async (): Promise<AuthUser> => {
  const user = await requireAuth();
  
  if (!user.isAdmin) {
    redirect("/");
  }
  
  return user;
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
};