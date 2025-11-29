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
  metadataBase: new URL('https://fetchsub.com'),
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
    url: "https://fetchsub.com",
    images: [
      {
        url: "https://fetchsub.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "FetchSub - Spline Watermark Remover",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spline Watermark Remover - Free & Online",
    description: "Remove Spline logo and watermarks from your 3D scenes instantly.",
    images: ["https://fetchsub.com/og-image.png"],
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
        <Script id="json-ld" type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "FetchSub",
              "applicationCategory": "DesignApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "description": "The best free tool to remove Spline logo and watermarks from .splinecode files. Works instantly in your browser.",
              "url": "https://fetchsub.com",
              "image": "https://fetchsub.com/og-image.png",
              "author": {
                "@type": "Organization",
                "name": "FetchSub"
              },
              "featureList": "Remove Spline Logo, Clean .splinecode files, Browser-based processing, Privacy-focused"
            }
          `}
        </Script>
        
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-[#E7E5E4]">
          <div className="flex items-center gap-2">
            <a href="/" className="font-bold text-xl tracking-tight text-[#1C1917]">FetchSub</a>
          </div>
          <div className="flex gap-6 text-sm font-medium text-[#57534E]">
            <a href="/" className="hover:text-[#1C1917] transition-colors">Spline Remover</a>
            <a href="/camscanner" className="hover:text-[#1C1917] transition-colors">CamScanner Remover</a>
          </div>
        </nav>

        <div className="pt-20">
          {children}
        </div>
      </body>
    </html>
  );
}
