import { RootProvider } from "fumadocs-ui/provider/next";
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { site } from "@/lib/site";
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
  title: {
    default: `${site.name} docs`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: `${site.name} docs`,
    description: site.description,
    type: "website",
    url: site.docs,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <body className="flex min-h-screen flex-col font-[family-name:var(--font-sans)] antialiased">
        <RootProvider
          theme={{
            defaultTheme: "dark",
            attribute: "class",
            enableSystem: true,
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
