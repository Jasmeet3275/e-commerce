import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "@/app/providers";
import { AnalyticsInit } from "@/components/analytics/AnalyticsInit";
import { Header } from "@/components/layout/Header";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Shop",
    template: "%s | Shop",
  },
  description: "Browse products, add to cart, and check out.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <AnalyticsInit />
          <ServiceWorkerRegistration />
          <OfflineBanner />
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
