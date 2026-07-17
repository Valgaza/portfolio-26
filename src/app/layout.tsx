import type { Metadata } from "next";
import {
  Geist,
  Anton,
  Martian_Mono,
  Space_Grotesk,
  Instrument_Serif,
  Syne,
  IBM_Plex_Sans,
  Newsreader,
  JetBrains_Mono,
  Space_Mono,
} from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/lib/animation/SmoothScrollProvider";
// DEV-ONLY identity explorer. Remove this import + the <TweaksPanel/> below
// before shipping (and the alternate fonts loaded here, if unused).
import TweaksPanel from "@/components/dev/TweaksPanel";

/**
 * Fonts. Each family owns a UNIQUE css variable (e.g. --font-anton). The three
 * "roles" the site actually renders with (display / body / mono) are a second
 * layer of vars defined in globals.css (--role-display / --role-body /
 * --role-mono) that POINT at one of these families. The tweaks panel swaps a
 * role's pointer live, so we can mix-and-match type without touching code.
 */
const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const martian = Martian_Mono({ variable: "--font-martian", subsets: ["latin"] });
const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
});
const syne = Syne({ variable: "--font-syne", subsets: ["latin"] });
const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const fontVars = [
  geist,
  martian,
  anton,
  spaceGrotesk,
  instrumentSerif,
  syne,
  ibmPlexSans,
  newsreader,
  jetbrainsMono,
  spaceMono,
]
  .map((f) => f.variable)
  .join(" ");

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
    <html lang="en" className={`${fontVars} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        {/* DEV-ONLY — delete before launch. */}
        <TweaksPanel />
      </body>
    </html>
  );
}
