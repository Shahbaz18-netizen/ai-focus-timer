import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Aura Focus OS",
  description: "Personalized AI Productivity Coach for Deep Work",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <main className="min-h-screen text-foreground selection:bg-accent selection:text-black">
          {children}
        </main>
      </body>
    </html>
  );
}
