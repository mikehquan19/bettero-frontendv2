import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Navbar from '@/components/navbar/Navbar';
import './globals.css';
import ThemeRegistry from './themeRegistry';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Bettero App',
  description:
    'Analytical personal finance tracker to give you insight into their spending behaviors',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeRegistry>
          <Navbar />
          <main className="ml-40 p-2 bg-gray-200">{children}</main>
        </ThemeRegistry>
      </body>
    </html>
  );
}
