import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
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
  title: "ClientReporter - Beautiful Client Reports in Minutes",
  description: "Automatically pull data from Google Analytics, create stunning PDF reports, and deliver them to clients on schedule.",
  keywords: ["client reporting", "analytics reports", "PDF reports", "marketing reports", "Google Analytics"],
  authors: [{ name: "ClientReporter" }],
  openGraph: {
    title: "ClientReporter - Beautiful Client Reports in Minutes",
    description: "Automatically pull data from Google Analytics, create stunning PDF reports, and deliver them to clients on schedule.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
