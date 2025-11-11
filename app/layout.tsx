import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";
import Footer from './components/footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tickr - Time Tracking",
  description: "Track your time efficiently with Tickr",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`} 
        suppressHydrationWarning
      >
        {/* Fixed Navbar at top */}
        <Navbar />
        
        {/* Main content with padding to prevent hiding behind fixed navbar & footer */}
        <main className="pt-20 pb-20 min-h-screen">
          {children}
        </main>
        
        {/* Fixed Footer at bottom */}
        <Footer />
      </body>
    </html>
  );
}