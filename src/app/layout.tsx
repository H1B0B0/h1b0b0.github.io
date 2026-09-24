import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageContext";

/* ---------- Fonts ---------- */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

/* ---------- SEO ---------- */
const SITE_URL = "https://h1b0b0.github.io";
const TITLE = "Etienne Mentrel — Développeur créatif & DevOps";
const DESCRIPTION =
  "Portfolio d'Etienne Mentrel, développeur créatif et ingénieur DevOps. Des expériences web singulières où direction artistique, interaction et ingénierie fonctionnent comme un tout.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · Etienne Mentrel",
  },
  description: DESCRIPTION,
  applicationName: "Portfolio — Etienne Mentrel",
  authors: [{ name: "Etienne Mentrel", url: SITE_URL }],
  creator: "Etienne Mentrel",
  keywords: [
    "Etienne Mentrel",
    "portfolio",
    "creative developer",
    "DevOps",
    "Three.js",
    "Next.js",
    "WebGL",
    "interactive",
    "creative coding",
    "direction artistique",
  ],
  alternates: {
    canonical: SITE_URL,
    languages: { en: SITE_URL, fr: SITE_URL },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Portfolio — Etienne Mentrel",
    locale: "fr_FR",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Portfolio créatif — Etienne Mentrel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
    creator: "@h1b0b0",
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    apple: "/apple-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#04030a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

/* Structured data for rich results (Person + WebSite). */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      name: "Etienne Mentrel",
      url: SITE_URL,
      jobTitle: "DevOps Engineer & Software Developer",
      email: "mailto:etienne.mentrel@gmail.com",
      sameAs: ["https://github.com/H1B0B0"],
    },
    {
      "@type": "WebSite",
      name: "Portfolio — Etienne Mentrel",
      url: SITE_URL,
      author: { "@id": SITE_URL + "#person" },
      inLanguage: ["en", "fr"],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased bg-black text-white`}
      >
        <LanguageProvider>{children}</LanguageProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
