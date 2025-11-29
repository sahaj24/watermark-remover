import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Social Media Safe Zone Checker - TikTok, Reels, Shorts | FetchSub",
  description: "Check if your video text and captions are covered by UI elements on TikTok, Instagram Reels, and YouTube Shorts. Free online safe zone overlay tool.",
  keywords: [
    "tiktok safe zone checker",
    "instagram reels safe zone",
    "youtube shorts ui overlay",
    "video safe area tester",
    "tiktok ui overlay png",
    "reels ui template",
    "social media video preview"
  ],
  openGraph: {
    title: "Social Media Safe Zone Checker - Free & Online",
    description: "Preview your video with TikTok, Reels, and Shorts UI overlays instantly.",
    type: "website",
    url: "https://fetchsub.com/safe-zone",
    images: [
      {
        url: "https://fetchsub.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "FetchSub - Safe Zone Checker",
      },
    ],
  },
  alternates: {
    canonical: "https://fetchsub.com/safe-zone",
  },
};

export default function SafeZoneLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Script id="safe-zone-json-ld" type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Social Media Safe Zone Checker",
            "applicationCategory": "MultimediaApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "Free tool to check video safe zones for TikTok, Instagram Reels, and YouTube Shorts.",
            "url": "https://fetchsub.com/safe-zone",
            "author": {
              "@type": "Organization",
              "name": "FetchSub"
            },
            "featureList": "TikTok UI Overlay, Reels Safe Zone, Shorts Preview, Browser-based"
          }
        `}
      </Script>
      {children}
    </>
  );
}
