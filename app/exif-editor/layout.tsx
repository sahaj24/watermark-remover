import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Exif Editor & Location Spoofer - Change Photo Metadata Online | FetchSub",
  description: "Edit or spoof photo metadata (EXIF) instantly. Change GPS location, date taken, and camera model of your images. Free, private, and works in your browser.",
  keywords: [
    "exif editor online",
    "change photo location",
    "spoof gps metadata",
    "edit photo date taken",
    "fake image location",
    "remove exif data",
    "add geotag to photo",
    "online metadata editor"
  ],
  openGraph: {
    title: "Exif Editor & Location Spoofer - Free & Online",
    description: "Change GPS location and date of your photos instantly. Create a digital alibi or protect your privacy.",
    type: "website",
    url: "https://fetchsub.com/exif-editor",
    images: [
      {
        url: "https://fetchsub.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "FetchSub - Exif Editor",
      },
    ],
  },
};

export default function ExifEditorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Script id="exif-editor-json-ld" type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Exif Editor & Location Spoofer",
            "applicationCategory": "UtilitiesApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "Free tool to edit or spoof photo metadata (EXIF) including GPS location and date.",
            "url": "https://fetchsub.com/exif-editor",
            "author": {
              "@type": "Organization",
              "name": "FetchSub"
            },
            "featureList": "Edit GPS Location, Change Date Taken, Modify Camera Model, Browser-based processing"
          }
        `}
      </Script>
      {children}
    </>
  );
}
