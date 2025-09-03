"use client";

import Link from "next/link";
import LogoIcon from "./logo";
import { usePathname } from "next/navigation";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";
import { MenuIcon, LogOutIcon, UserIcon, ShieldIcon } from "lucide-react";
import { useMediaQuery } from "../hook/use-media-query";
import { Button } from "./ui/button";
import { logoutAction } from "../_actions/auth/logout";

interface NavbarProps {
  user: {
    name: string;
    isPremium: boolean;
    isAdmin: boolean;
  };
}

const Navbar = ({ user }: NavbarProps) => {
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!user) {
    return null; // Ou um esqueleto de carregamento (loading skeleton)
  }

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <nav className="flex justify-between border-b border-solid px-8 py-4">
      {isDesktop ? (
        <>
          <div className="flex items-center gap-10">
            <LogoIcon />
            <Link
              href="/"
              className={
                pathname === "/"
                  ? "font-bold text-primary"
                  : "text-muted-foreground"
              }
            >
              Dashboard
            </Link>
            <Link
              href="/transactions"
              className={
                pathname === "/transactions"
                  ? "font-bold text-primary"
                  : "text-muted-foreground"
              }
            >
              Transações
            </Link>
            <Link
              href="/subscription"
              className={
                pathname === "/subscription"
                  ? "font-bold text-primary"
                  : "text-muted-foreground"
              }
            >
              Assinatura
            </Link>
            <Link
              href="/profile"
              className={
                pathname === "/profile"
                  ? "font-bold text-primary"
                  : "text-muted-foreground"
              }
            >
              Perfil
            </Link>
            {user.isAdmin && (
              <Link
                href="/admin"
                className={
                  pathname === "/admin"
                    ? "font-bold text-primary"
                    : "text-muted-foreground"
                }
              >
                Admin
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <UserIcon size={16} />
              <span className="text-sm">{user.name}</span>
              {user.isPremium && (
                <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                  Premium
                </span>
              )}
              {user.isAdmin && (
                <ShieldIcon size={16} className="text-yellow-500" />
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOutIcon size={16} />
              Sair
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex w-full items-center justify-between">
            <LogoIcon />
            <Drawer>
              <DrawerTrigger>
                <MenuIcon size={32} />
              </DrawerTrigger>
              <DrawerContent className="flex flex-col items-center gap-12 pb-12">
                <div className="flex items-center gap-2">
                  <UserIcon size={16} />
                  <span className="text-sm">{user.name}</span>
                  {user.isPremium && (
                    <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                      Premium
                    </span>
                  )}
                  {user.isAdmin && (
                    <ShieldIcon size={16} className="text-yellow-500" />
                  )}
                </div>
                <Link
                  href="/"
                  className={
                    pathname === "/"
                      ? "border-b border-primary font-bold text-primary"
                      : "text-muted-foreground"
                  }
                >
                  Dashboard
                </Link>
                <Link
                  href="/transactions"
                  className={
                    pathname === "/transactions"
                      ? "border-b border-primary font-bold text-primary"
                      : "text-muted-foreground"
                  }
                >
                  Transações
                </Link>
                <Link
                  href="/subscription"
                  className={
                    pathname === "/subscription"
                      ? "border-b border-primary font-bold text-primary"
                      : "text-muted-foreground"
                  }
                >
                  Assinatura
                </Link>
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className={
                      pathname === "/admin"
                        ? "border-b border-primary font-bold text-primary"
                        : "text-muted-foreground"
                    }
                  >
                    Admin
                  </Link>
                )}
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOutIcon size={16} />
                  Sair
                </Button>
              </DrawerContent>
            </Drawer>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
