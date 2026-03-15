import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "CreditSwap",
  description: "Swap dining credits with fellow NUS residents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased relative">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="relative z-10">{children}</main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
