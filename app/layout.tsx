export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "NFL Squares - Modern Edition",
  description: "Beautiful NFL squares board application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
