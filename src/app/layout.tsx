import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import Script from 'next/script';

const siteUrl = 'https://voidwear.co.in';

export const viewport: Viewport = {
  themeColor: '#f9f9f9',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'VOID WEAR | EMBRACE THE UNKNOWN',
    template: '%s | VOID WEAR'
  },
  description: 'VOID WEAR | EMBRACE THE UNKNOWN. High-performance technical assemblages for the urban explorer.',
  keywords: ['VOID WEAR', 'EMBRACE THE UNKNOWN', 'technical apparel', 'modern style', 'urban fashion', 'minimalist clothing'],
  authors: [{ name: 'VOID WEAR collective' }],
  creator: 'VOID WEAR',
  publisher: 'VOID WEAR INC.',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    title: 'VOID WEAR | EMBRACE THE UNKNOWN',
    description: 'High-performance apparel for the modern environment.',
    siteName: 'VOID WEAR',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'VOID WEAR Manifesto',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VOID WEAR | EMBRACE THE UNKNOWN',
    description: 'High-performance apparel for the modern environment.',
    creator: '@voidwearoff_26',
    images: ['/logo.png'],
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
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;600&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-background text-black selection:bg-black selection:text-white overflow-x-hidden">
        <FirebaseClientProvider>
          <div className="noise-overlay" />
          <Navbar />
          <main className="relative z-10 min-h-screen">
            {children}
          </main>
          <Footer />
          <Toaster />
          <Script 
            src="https://checkout.razorpay.com/v1/checkout.js" 
            strategy="afterInteractive" 
          />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
