import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "محرر فيديو و موشن ديزاينر احترافي | Portfolio",
  description: "عرض مشاريعي في مجال تحرير الفيديو والموشن ديزاين بتصميم احترافي وعصري",
  generator: "Next.js",
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
