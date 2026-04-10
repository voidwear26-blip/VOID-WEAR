
import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Toaster } from '@/components/ui/toaster';
import { CustomCursor } from '@/components/custom-cursor';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'VOID WEAR | ASCEND THE VOID',
  description: 'Premium futuristic technical shells for the digital migration.',
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
      </head>
      <body className="antialiased bg-black text-white selection:bg-white selection:text-black overflow-x-hidden">
        <FirebaseClientProvider>
          <div className="noise-overlay" />
          <CustomCursor />
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
