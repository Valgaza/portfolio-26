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
  src: [
    { path: "../../content/Kovanov-Regular.otf", weight: "400", style: "normal" },
    { path: "../../content/Kovanov Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-kovanov",
  display: "swap",
});
const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});
const martian = Martian_Mono({ variable: "--font-martian", subsets: ["latin"] });

const fontVars = [kovanov, hanken, martian].map((f) => f.variable).join(" ");

export const metadata: Metadata = {
  title: "Aarya Patil",
  description: "Portfolio — engineering, projects, and an AI who knows me.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontVars} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Set the saved theme before paint so there's no flash of the wrong
            mode. Default is dark; only "light" is stored + applied here. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='light')document.documentElement.setAttribute('data-theme','light')}catch(e){}`,
          }}
        />
        <Preloader />
        <ParticleBackground />
        <Navbar />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
