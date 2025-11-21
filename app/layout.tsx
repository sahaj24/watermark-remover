import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  title: "Spline Watermark Remover - Free & Online | FetchSub",
  description: "The best free tool to remove Spline logo and watermarks from .splinecode files. Works instantly in your browser. No signup, no upload, 100% private.",
  keywords: [
    "spline watermark remover",
    "remove spline logo",
    "spline 3d watermark",
    "splinecode cleaner",
    "how to remove spline watermark",
    "spline logo remover free",
    "clean spline scene",
    "spline 3d remove logo",
    "fetchsub",
    "spline design watermark"
  ],
  authors: [{ name: "FetchSub" }],
  openGraph: {
    title: "Spline Watermark Remover - Free & Online",
    description: "Remove Spline logo and watermarks from your 3D scenes instantly. Free, private, and runs entirely in your browser.",
    type: "website",
    locale: "en_US",
    siteName: "FetchSub",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spline Watermark Remover - Free & Online",
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
      <head>
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SN19DEDP9H"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-SN19DEDP9H');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
