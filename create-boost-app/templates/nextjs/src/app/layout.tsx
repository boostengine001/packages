import type { Metadata } from 'next';
import '@boostengine/ui/styles.css';
import './globals.css';
import { BoostProvider } from '@boostengine/ui';
import { StoreProvider } from '../context/StoreContext';
import { AdBanner } from '../components/AdBanner';
import { Navbar } from '../components/Navbar';
import { GlobalCartDrawer } from '../components/GlobalCartDrawer';
import { Footer } from '../components/Footer';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { AiShoppingAssistant } from '../components/AiShoppingAssistant';

export const metadata: Metadata = {
  title: 'Boost D2C Store | High Converting Modern Streetwear',
  description: 'Built with BoostEngine 15 micro-packages, Next.js 15, and tailored Indian GST calculations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-black selection:text-white bg-white text-gray-900 dark:bg-[#090d16] dark:text-gray-100">
        <BoostProvider defaultMode="system" defaultStylePreset="minimal">
          <StoreProvider>
            <AdBanner />
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <GlobalCartDrawer />
            <AiShoppingAssistant />
            <Footer />
            <MobileBottomNav />
          </StoreProvider>
        </BoostProvider>
      </body>
    </html>
  );
}
