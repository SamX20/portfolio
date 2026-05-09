import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Sam Motion - Motion Graphics Designer and Video Editor',
  description:
    'Sam is a motion graphics designer and video editor creating branded motion, social ads, explainers, and cinematic edits.',
  keywords: [
    'Sam Motion',
    'motion graphics',
    'video editor',
    'After Effects',
    'Premiere Pro',
    'موشن جرافيك',
    'مونتاج فيديو',
    'سامر',
  ],
  authors: [{ name: 'Sam' }],
  creator: 'Sam',
  metadataBase: new URL('https://xsamer.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Sam Motion - Motion Graphics Designer and Video Editor',
    description: 'Motion graphics, video editing, social ads, explainers, and brand films by Sam.',
    url: 'https://xsamer.com',
    siteName: 'Sam Motion',
    locale: 'en_US',
    alternateLocale: ['ar_JO'],
    type: 'website',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Sam Motion portfolio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sam Motion',
    description: 'Motion graphics and video editing portfolio by Sam.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cairo.variable} h-full antialiased scroll-smooth`}>
      <head>
        <meta charSet="utf-8" />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-6KLPJVFHEB" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6KLPJVFHEB');
          `}
        </Script>
      </head>
      <body className="min-h-full bg-[#080808] text-white">{children}</body>
    </html>
  );
}
