import type { Metadata } from "next";
import { Playfair_Display, Dancing_Script, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const dancing = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Baby Shower Celebration | Vaibhav & Khyati",
  description:
    "You're warmly invited to celebrate the upcoming arrival of Vaibhav & Khyati's little one. Join us for a beautiful baby shower filled with love, laughter, and joy.",
  keywords: [
    "baby shower",
    "Vaibhav Khyati baby shower",
    "baby shower invitation",
    "baby shower celebration",
    "baby arrival",
  ],
  authors: [{ name: "Vaibhav & Khyati" }],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    type: "website",
    title: "Baby Shower Celebration — Vaibhav & Khyati",
    description:
      "You're warmly invited to celebrate the upcoming arrival of Vaibhav & Khyati's little one. Join us for a beautiful baby shower filled with love, laughter, and joy.",
    siteName: "Baby Shower | Vaibhav & Khyati",
    images: [
      {
        url: "/assets/hero_bg_new.png",
        width: 1200,
        height: 630,
        alt: "Baby Shower Celebration — Vaibhav & Khyati",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Baby Shower Celebration — Vaibhav & Khyati",
    description:
      "You're warmly invited to celebrate the upcoming arrival of Vaibhav & Khyati's little one.",
    images: ["/assets/hero_bg_new.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "icon", url: "/icon-512.png" }],
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
      className={`${playfair.variable} ${dancing.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
