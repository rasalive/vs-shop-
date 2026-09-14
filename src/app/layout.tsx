import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { SalesTicker } from "@/components/SalesTicker";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vortex | The Ultimate Gaming & Digital Key Marketplace",
  description:
    "Buy instant delivery Steam keys, Netflix lifetime subscriptions, modded GTA V accounts, ChatGPT Plus, and digital tools with 24/7 support and warranty.",
  keywords: [
    "Gaming Marketplace",
    "Digital Keys",
    "Steam Keys",
    "Eldorado",
    "WaveBoosts",
    "Netflix Lifetime",
    "Instant Delivery",
    "Vortex",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-[#f5f6fb] text-slate-900 min-h-screen flex flex-col antialiased selection:bg-[#5842f5] selection:text-white`}
      >
        <Providers>
          <AnnouncementBar />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <SalesTicker />
        </Providers>
      </body>
    </html>
  );
}
