import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Optimized font loading for Lighthouse performance
 * Using font-display: swap to prevent layout shift
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap", // Prevent FOUT (Flash of Unstyled Text)
  preload: true,
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap", // Prevent FOUT
  preload: true,
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "ElectionGuide India | Empowering Indian Voters",
  description: "Official guide for Indian election processes, EPIC registration, and Lok Sabha timeline tracking.",
  robots: "index, follow",
  openGraph: {
    title: "ElectionGuide India",
    description: "Comprehensive election process guide for Indian voters",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <head>
        {/* DNS prefetch for API calls only - fonts are self-hosted via Next.js */}
        <link rel="dns-prefetch" href="https://generativelanguage.googleapis.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        
        {/* Web vitals optimization */}
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="min-h-full flex flex-col font-inter">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:px-6 focus:py-3 focus:bg-primary focus:text-white focus:rounded-xl focus:font-bold focus:shadow-2xl transition-all"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1 focus:outline-none">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
