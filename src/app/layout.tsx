
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import Script from 'next/script';

const siteUrl = 'https://voidwear.co.in';

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'VOID WEAR | Premium Techwear & Futuristic Apparel',
    template: '%s | VOID WEAR'
  },
  description: 'VOID WEAR provides high-performance futuristic technical assemblages. Minimalist architecture and cinematic aesthetics for the digital migration.',
  keywords: ['techwear', 'futuristic clothing', 'cyberpunk apparel', 'urban explorer gear', 'minimalist architecture', 'VOID WEAR'],
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
    description: 'High-performance technical shells for the high-density urban environment.',
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
    description: 'Premium futuristic technical shells for the digital migration.',
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
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;600&display=swap" rel="stylesheet" />
        
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-XXXXXXX');
          `}
        </Script>
      </head>
      <body className="antialiased bg-black text-white selection:bg-white selection:text-black overflow-x-hidden">
        <FirebaseClientProvider>
          <div className="noise-overlay" />
          <Navbar />
          <main className="relative z-10 min-h-screen">
            {children}
          </main>
          <Footer />
          <Toaster />
          <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
