import type { Metadata, Viewport } from 'next';
import { Cairo, Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'XSam Studio — Web, Video & Brand',
  description:
    'XSam Studio is a creative studio crafting websites, online stores, video editing, motion design, logos and brand identities.',
  keywords: [
    'XSam Studio',
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
  creator: 'XSam Studio',
  metadataBase: new URL('https://www.xsamer.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: ['/favicon.png'],
    apple: [
      { url: '/favicon.png', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'XSam Studio — Web, Video & Brand',
    description:
      'Professional video editing and 2D/3D motion graphics design by Xsamer for promos, social media content, and visual stories.',
    url: 'https://www.xsamer.com',
    siteName: 'XSam Studio',
    locale: 'en_US',
    alternateLocale: ['ar_JO'],
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'XSam Studio — websites, online stores, video, motion and branding' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XSam Studio — Web, Video & Brand',
    description: 'Professional video editing and 2D/3D motion graphics portfolio by Xsamer.',
    images: ['/og-image.png'],
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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${cairo.variable} h-full antialiased scroll-smooth`}>
      <head>
        <meta charSet="utf-8" />
        {/* Hide the first-visit splash before paint for returning visitors */}
        <script
          dangerouslySetInnerHTML={{ __html: "try{if(localStorage.getItem('xsam-splash-seen'))document.documentElement.classList.add('xs-seen')}catch(e){}" }}
        />
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
      <body className="min-h-full">{children}</body>
    </html>
  );
}
