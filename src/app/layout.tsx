import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { copy } from "@/data/catalog";
import "./globals.css";

/** Archivo, variable in weight and width: body text and the condensed display voice. */
const archivo = localFont({
  src: "./fonts/archivo-latin.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-archivo",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

export const metadata: Metadata = {
  title: copy.pageTitle,
  description: copy.pageDescription,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#c4141f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={archivo.variable}>
      <body>{children}</body>
    </html>
  );
}
