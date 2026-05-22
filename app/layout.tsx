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
  title: 'Xsamer | Freelance Video Editor & Motion Graphics Designer',
  description:
    'Professional video editing and 2D/3D motion graphics design by Xsamer. Transforming raw footage into engaging visual stories, promos, and social media content.',
  keywords: [
    'Xsamer',
    'video editor',
    'motion graphics designer',
    'freelance video editing',
    'After Effects animator',
    'video post production',
    'visual effects artist',
    '2D motion graphics',
    '3D motion graphics',
    'social media content',
    'Samer Jaber',
    'Sam Jaber',
    'موشن جرافيك',
    'مونتاج فيديو',
    'سامر جابر',
  ],
  authors: [{ name: 'Samer Jaber' }],
  creator: 'Xsamer',
  metadataBase: new URL('https://xsamer.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/favicon.svg'],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: 'Xsamer | Freelance Video Editor & Motion Graphics Designer',
    description:
      'Professional video editing and 2D/3D motion graphics design by Xsamer for promos, social media content, and visual stories.',
    url: 'https://xsamer.com',
    siteName: 'Xsamer',
    locale: 'en_US',
    alternateLocale: ['ar_JO'],
    type: 'website',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Xsamer video editing and motion graphics portfolio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Xsamer | Freelance Video Editor & Motion Graphics Designer',
    description: 'Professional video editing and 2D/3D motion graphics portfolio by Xsamer.',
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
