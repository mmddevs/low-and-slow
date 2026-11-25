import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { copy } from "@/data/catalog";
import "./globals.css";

/** Banner and display lettering. */
const anton = localFont({
  src: "./fonts/anton-400-latin.woff2",
  weight: "400",
  display: "swap",
  variable: "--font-anton",
});

/** Body and UI text (variable weight). */
const archivo = localFont({
  src: "./fonts/archivo-latin.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-archivo",
});

/** Hand-written prices on the stars and the board. */
const marker = localFont({
  src: "./fonts/permanent-marker-400-latin.woff2",
  weight: "400",
  display: "swap",
  variable: "--font-marker",
});

export const metadata: Metadata = {
  title: copy.pageTitle,
  description: copy.pageDescription,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#d8cfbd",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${anton.variable} ${archivo.variable} ${marker.variable}`}>
      <body>{children}</body>
    </html>
  );
}
