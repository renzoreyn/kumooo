import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://app.kumooo.dev"),
  title: {
    default: "kumooo dashboard",
    template: "%s · kumooo",
  },
  description: "Host sites on kumooo.site",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "kumooo dashboard",
    description: "Host sites on kumooo.site",
    type: "website",
    url: "https://app.kumooo.dev",
    siteName: "kumooo.js",
  },
  twitter: {
    card: "summary_large_image",
    title: "kumooo dashboard",
    description: "Host sites on kumooo.site",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
