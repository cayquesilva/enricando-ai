import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./app/_lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ["/login"];
  
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Verificar token de autenticação
  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verificar se o token é válido
  const decoded = verifyToken(token);
  
  if (!decoded) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth-token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};