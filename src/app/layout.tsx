import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, Martian_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/lib/animation/SmoothScrollProvider";
import Preloader from "@/components/ui/Preloader";
import ParticleBackground from "@/components/ui/ParticleBackground";
import Navbar from "@/components/ui/Navbar";

/**
 * Fonts — a study of Sarvam.ai's type system (their commercial Season Mix /
 * Matter aren't licensable, so these are the closest open equivalents):
 *   • display → Fraunces, an expressive variable serif (≈ Season Mix)
 *   • body    → Hanken Grotesk, a warm grotesque (≈ Matter)
 *   • mono    → Martian Mono
 * Each owns a unique css var; the rendered roles (--role-display / -body / -mono
 * in globals.css) point at one of these.
 */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});
const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});
const martian = Martian_Mono({ variable: "--font-martian", subsets: ["latin"] });

const fontVars = [fraunces, hanken, martian].map((f) => f.variable).join(" ");

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
