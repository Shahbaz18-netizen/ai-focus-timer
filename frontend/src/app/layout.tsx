import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { DesktopViewportEnforcer } from "@/components/ui/DesktopViewportEnforcer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Aura Focus OS",
  description: "Personalized AI Productivity Coach for Deep Work",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aura OS",
  },
  icons: {
    apple: "/globe.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <DesktopViewportEnforcer />
        <main className="min-h-screen text-foreground selection:bg-accent selection:text-black">
          {children}
        </main>
      </body>
    </html>
  );
}
