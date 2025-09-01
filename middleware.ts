import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  // Se o utilizador TEM um token e está a tentar aceder a /login, redirecione para a home.
  if (token && pathname.startsWith("/login")) {
    console.log("Token válido... redirecionando para rota home");
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Se o utilizador NÃO TEM um token e está a tentar aceder a uma rota protegida,
  // redirecione para /login.
  if (!token && pathname !== "/login") {
    console.log("Token inválido... redirecionando para rota login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Se nenhuma das condições acima for atendida, o pedido pode continuar.
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Aplica o middleware a todas as rotas, exceto ficheiros estáticos e internos do Next.js
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
