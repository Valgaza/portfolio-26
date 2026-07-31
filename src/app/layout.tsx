import type { Metadata } from "next";
import localFont from "next/font/local";
import { Hanken_Grotesk, Martian_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/lib/animation/SmoothScrollProvider";
import Preloader from "@/components/ui/Preloader";
import ParticleBackground from "@/components/ui/ParticleBackground";
import Navbar from "@/components/ui/Navbar";

/**
 * Fonts. The rendered roles (--role-display / -body / -mono in globals.css)
 * point at one of these:
 *   • display → Kovanov (local OTF in /content — free for personal use)
 *   • body    → Hanken Grotesk
 *   • mono    → Martian Mono
 */
const kovanov = localFont({
  src: "../../content/Kovanov-Regular.otf",
  variable: "--font-kovanov",
  weight: "400",
  style: "normal",
  display: "swap",
});
const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});
const martian = Martian_Mono({ variable: "--font-martian", subsets: ["latin"] });

const fontVars = [kovanov, hanken, martian].map((f) => f.variable).join(" ");

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
