import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import { Toaster } from "./_components/ui/sonner";

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
      <body className={`${mulish.className} dark antialiased`}>
        <div className="flex h-full flex-col lg:overflow-hidden">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
