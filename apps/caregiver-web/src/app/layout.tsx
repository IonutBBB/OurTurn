import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import I18nProvider from '../providers/I18nProvider';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MemoGuard - Dementia Care Platform',
  description:
    'AI-powered daily care platform helping families manage life with dementia',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-surface-background`}>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
