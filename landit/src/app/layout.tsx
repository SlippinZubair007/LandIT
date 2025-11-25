import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClerkProvider from "@/providers/ConvexClerkProvider";
import { ThemeProvider } from "@/components/common/ThemeContext";
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LandIT",
  description: "AI Powered job finder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ConvexClerkProvider>
          <ThemeProvider>
            <Header/>
            <main className="pt-24 flex-grow">{children}</main>
            <Footer/>
          </ThemeProvider>
        </ConvexClerkProvider>
      </body>
    </html>
  );
}