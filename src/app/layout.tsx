import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Oficina IA & Arte | PUC-Rio",
  description: "Oficina prática sobre Inteligência Artificial e Arte na PUC-Rio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-[var(--background)] text-[var(--foreground)] min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
