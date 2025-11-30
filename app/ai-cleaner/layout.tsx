import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "AI Watermark Remover - Clean Invisible Watermarks & Metadata | FetchSub",
  description: "Remove invisible AI watermarks, C2PA credentials, and metadata from AI-generated images (Midjourney, DALL-E, Stable Diffusion). Make your AI art undetectable.",
  keywords: [
    "remove ai watermark",
    "clean ai metadata",
    "remove c2pa",
    "midjourney watermark remover",
    "stable diffusion metadata remover",
    "invisible watermark cleaner",
    "ai art detector bypass",
    "strip image metadata"
  ],
  openGraph: {
    title: "AI Watermark Remover - Clean Invisible Watermarks",
    description: "Remove invisible watermarks and metadata from AI-generated images instantly.",
    type: "website",
    url: "https://fetchsub.com/ai-cleaner",
    images: [
      {
        url: "https://fetchsub.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "FetchSub - AI Watermark Remover",
      },
    ],
  },
};

export default function AiCleanerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Script id="ai-cleaner-json-ld" type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "AI Watermark Remover",
            "applicationCategory": "UtilitiesApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "Free tool to remove invisible AI watermarks and metadata from images.",
            "url": "https://fetchsub.com/ai-cleaner",
            "author": {
              "@type": "Organization",
              "name": "FetchSub"
            },
            "featureList": "Strip Metadata, Remove C2PA, Disrupt Invisible Watermarks, Browser-based"
          }
        `}
      </Script>
      {children}
    </>
  );
}
