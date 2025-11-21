import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FDFBF7",
};

export const metadata: Metadata = {
  title: "FetchSub - Free Spline Watermark Remover",
  description: "Remove Spline logo and watermarks from your 3D scenes instantly. Free, private, and runs entirely in your browser. No signup required.",
  keywords: ["spline", "watermark remover", "3d", "webgl", "spline tool", "cleaner", "logo remover"],
  authors: [{ name: "FetchSub" }],
  openGraph: {
    title: "FetchSub - Free Spline Watermark Remover",
    description: "Remove Spline logo and watermarks from your 3D scenes instantly. Free, private, and runs entirely in your browser.",
    type: "website",
    locale: "en_US",
    siteName: "FetchSub",
  },
  twitter: {
    card: "summary_large_image",
    title: "FetchSub - Free Spline Watermark Remover",
    description: "Remove Spline logo and watermarks from your 3D scenes instantly.",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
