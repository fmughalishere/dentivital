import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/layout/Providers";
import SiteChrome from "@/components/layout/SiteChrome";
import { getSession } from "@/lib/auth";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Dentivital — Triple Action, Zero Sensitivity Whitening",
    template: "%s · Dentivital",
  },
  description:
    "Teeth whitening made easy and safe with Dentivital. Enamel restoration, improved gum health, and zero-sensitivity whitening in one easy application.",
  openGraph: {
    title: "Dentivital — Triple Action, Zero Sensitivity Whitening",
    description:
      "Whiter teeth, repaired enamel and healthier gums in one 30-minute application. All-natural, clinically backed formulas.",
    type: "website",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <html lang="en" data-scroll-behavior="smooth">
      {/* Browser extensions such as Grammarly inject attributes onto <body>
          before React hydrates, which React reports as a mismatch. */}
      <body
        suppressHydrationWarning
        className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} antialiased`}
      >
        <Providers initialUser={session}>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
