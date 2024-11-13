"use client";

import Link from "next/link";
import LogoIcon from "./logo";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "../hook/use-media-query";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";
import { MenuIcon } from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();

  //usando hook permitindo uso de mediaquerys.
  const isDesktop = useMediaQuery("(min-width: 768px)");

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
          </div>
          <UserButton showName />
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
                <UserButton showName />
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
              </DrawerContent>
            </Drawer>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
