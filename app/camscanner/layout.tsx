import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "CamScanner Watermark Remover - Free Online PDF Cleaner | FetchSub",
  description: "Remove 'Scanned with CamScanner' footer from PDFs instantly. Free, private, and works in your browser. No signup required.",
  keywords: [
    "camscanner watermark remover",
    "remove camscanner footer",
    "clean scanned pdf",
    "camscanner logo remover",
    "remove scanned with camscanner",
    "pdf watermark remover online free",
    "camscanner alternative",
    "fetchsub camscanner"
  ],
  openGraph: {
    title: "CamScanner Watermark Remover - Free & Online",
    description: "Remove 'Scanned with CamScanner' footer from your PDFs instantly. Free and private.",
    type: "website",
    url: "https://fetchsub.com/camscanner",
    images: [
      {
        url: "https://fetchsub.com/og-image.png", // We can use the same one or create a specific one later
        width: 1200,
        height: 630,
        alt: "FetchSub - CamScanner Watermark Remover",
      },
    ],
  },
};

export default function CamScannerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Script id="camscanner-json-ld" type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "CamScanner Watermark Remover",
            "applicationCategory": "UtilitiesApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "Free tool to remove CamScanner watermarks and footers from PDF files online.",
            "url": "https://fetchsub.com/camscanner",
            "author": {
              "@type": "Organization",
              "name": "FetchSub"
            },
            "featureList": "Remove CamScanner Footer, Clean PDF, Browser-based processing, Privacy-focused"
          }
        `}
      </Script>
      {children}
    </>
  );
}
