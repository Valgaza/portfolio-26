import type { Metadata } from "next";
import { Geist, Anton, Martian_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/lib/animation/SmoothScrollProvider";
import Preloader from "@/components/ui/Preloader";
import ParticleBackground from "@/components/ui/ParticleBackground";
import Navbar from "@/components/ui/Navbar";

/**
 * Fonts. Each family owns a UNIQUE css variable (e.g. --font-anton). The three
 * roles the site renders with (display / body / mono) are a second layer of
 * vars in globals.css (--role-display / --role-body / --role-mono) that point at
 * one of these families.
 */
const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const martian = Martian_Mono({ variable: "--font-martian", subsets: ["latin"] });
const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const fontVars = [geist, martian, anton].map((f) => f.variable).join(" ");

export const metadata: Metadata = {
  title: "Aarya Patil — AI/ML Developer",
  description: "Portfolio — engineering, projects, and an AI who knows me.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVars} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Preloader />
        <ParticleBackground />
        <Navbar />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
