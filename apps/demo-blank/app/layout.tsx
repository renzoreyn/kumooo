import type { Metadata } from "next";
import { DM_Sans, Sora } from "next/font/google";
import { DemoBanner } from "../components/demo-banner";
import { SiteHeader } from "../components/site-header";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const display = Sora({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  metadataBase: new URL("https://blank.kumooo.site"),
  title: "Blank · kumooo.js demo",
  description: "Live blank starter playground for kumooo.js",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Blank · kumooo.js demo",
    description: "Live blank starter playground for kumooo.js",
    type: "website",
    url: "https://blank.kumooo.site",
    siteName: "kumooo.js",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blank · kumooo.js demo",
    description: "Live blank starter playground for kumooo.js",
  },
};

const themeInit = `(function(){try{var k='kumooo-blank-theme';var t=localStorage.getItem(k);var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-screen antialiased">
        <DemoBanner starter="blank" />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
