import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Comeback: Unrecognizable — Feedback Survey',
  description: 'Quick feedback survey for Comeback: Unrecognizable.',
};

export const viewport: Viewport = {
  themeColor: '#0B0A09',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#0B0A09] text-[#F5F3EF] antialiased min-h-screen selection:bg-[#D4AF37]/20 selection:text-[#F5F3EF]">
        {children}
      </body>
    </html>
  );
}
