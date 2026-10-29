import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store/app-context";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "VISIONFLIX – Netflix Support Concierge",
  description: "Premium customer support portal for TV activation assistance, Netflix Household verification guidance, and administrative concierge.",
  applicationName: "VisionFlix Support",
  authors: [{ name: "VisionFlix Support Systems" }],
  keywords: ["Netflix Support", "TV Activation", "Netflix Household Help", "VisionFlix Support"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#08080A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-visionDark-950 text-white min-h-screen flex flex-col`}>
        <AppProvider>
          <DisclaimerBanner compact />
          <Navbar />
          <main className="flex-1 pb-safe-bottom">
            {children}
          </main>
          <Footer />
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
