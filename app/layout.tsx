import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

/**
 * Booton is the only typeface used by the product (as specified in Figma).
 * Weights: 400 (search placeholder), 500 (labels / buttons), 600 (emphasis).
 */
const booton = localFont({
  src: [
    { path: "./fonts/Booton-TRIAL-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/Booton-TRIAL-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/Booton-TRIAL-SemiBold.otf", weight: "600", style: "normal" },
  ],
  variable: "--font-booton",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Icona — Icon Library",
  description: "A cohesive, animated SVG icon library. Search, filter, save and copy icons as SVG.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={booton.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
