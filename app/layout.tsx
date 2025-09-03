import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import { Toaster } from "./_components/ui/sonner";
import Footer from "./_components/footer"; // 1. Importe o Footer

const mulish = Mulish({
  subsets: ["latin-ext"],
});

export const metadata: Metadata = {
  title: "Enrica-AI",
  description: "Gerenciamento Financeiro com IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${mulish.className} dark flex min-h-screen flex-col antialiased`}
      >
        <main className="flex-1">{children}</main>

        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
