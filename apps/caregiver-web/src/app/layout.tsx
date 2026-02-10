import type { Metadata } from 'next';
import { Fraunces, Nunito } from 'next/font/google';
import './globals.css';
import I18nProvider from '../providers/I18nProvider';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/toast';

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  display: 'swap',
});

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  display: 'swap',
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ourturn.app';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'OurTurn — Daily Care for Families Living with Dementia',
    template: '%s | OurTurn',
  },
  description:
    'OurTurn helps families organize daily routines, coordinate care, and stay connected — a calm app for your loved one, a powerful hub for you.',
  keywords: [
    'family caregiver',
    'daily care plan',
    'caregiver support app',
    'dementia daily routine',
    'care coordination',
    'family care',
    'caregiver wellbeing',
    'daily care management',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'OurTurn',
    title: 'OurTurn — Daily Care for Families Living with Dementia',
    description:
      'A calm, clear app for your loved one. A powerful hub for you. Organize daily routines, coordinate family care, and get AI-powered support.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'OurTurn — Daily care for families' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OurTurn — Daily Care for Families Living with Dementia',
    description:
      'Organize daily routines, coordinate family care, and get AI-powered support.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: baseUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (theme === 'system' || !theme) && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${fraunces.variable} ${nunito.variable} font-sans antialiased bg-surface-background`}>
        <ThemeProvider>
          <I18nProvider>
            <ToastProvider>{children}</ToastProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
