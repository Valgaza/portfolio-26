import type { Metadata } from "next";
import { Geist, Anton, Martian_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/lib/animation/SmoothScrollProvider";

// Body copy — a clean, neutral grotesque.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Display — the big, wide wordmarks (hero words, project titles, name).
// Anton ships a single weight, so it must be specified.
const anton = Anton({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

// Monospace — every UI label, counter, and the footer clock.
const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio",
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
      className={`${geistSans.variable} ${anton.variable} ${martianMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
