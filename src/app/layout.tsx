import type { Metadata } from 'next';
import Navbar from '@components/navbar/Navbar';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import './globals.css';
import BannerProvider from '@components/snackbar/BannerProvider';

export const metadata: Metadata = {
  title: 'Bettero App',
  description:
    'Analytical personal finance tracker to give you insight into your spending behaviors',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <BannerProvider>
            <Navbar />
            <main className="ml-40 p-2">{children}</main>
          </BannerProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
