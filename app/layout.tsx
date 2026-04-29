import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "سامر جابر - مصمم ومحرر فيديو احترافي | Portfolio",
  description: "محترف في إنتاج المحتوى البصري والمونتاج والتصميم. شاهد أعمالي في مجال الإعلانات التجارية، الفيديوهات التعليمية، والموشن جرافيك بأحدث التقنيات.",
  keywords: [
    "مونتاج فيديو",
    "تصميم",
    "إعلانات تجارية",
    "محرر فيديو",
    "موشن ديزاين",
    "سامر",
    "سامر جابر",
    "فيديو ترويجي",
    "محتوى بصري",
    "Premiere Pro",
    "After Effects",
    "Cinema 4D"
  ],
  authors: [{ name: "سامر جابر" }],
  creator: "سامر جابر",
  publisher: "سامر جابر",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://samerx.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "سامر جابر - مصمم ومحرر فيديو احترافي",
    description: "محترف في إنتاج المحتوى البصري والمونتاج والتصميم. شاهد أعمالي في مجال الإعلانات والفيديوهات.",
    url: "https://samerx.vercel.app",
    siteName: "Portfolio سامر جابر",
    locale: "ar_SA",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "سامر جابر - مصمم ومحرر فيديو احترافي",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "سامر جابر - مصمم ومحرر فيديو احترافي",
    description: "محترف في إنتاج المحتوى البصري والمونتاج والتصميم.",
    images: ["/og-image.svg"],
    creator: "@yourusername",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "HPgF8T-bkbnXrO1pADTn7F8hDtNlN5s8Kn_tWgeaRM8",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <meta charSet="utf-8" />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-6KLPJVFHEB`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6KLPJVFHEB');
          `}
        </Script>
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{ backgroundColor: "#0a0a0f" }}
      >
        {children}
      </body>
    </html>
  );
}
