import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import { ClientLayout } from './client-layout';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0f0c29' },
    { media: '(prefers-color-scheme: light)', color: '#f5f7fa' },
  ],
};

export const metadata: Metadata = {
  title: 'Planilha Financeira v2',
  description: 'Gerencie suas finanças pessoais de forma simples e eficiente',
  keywords: ['finanças', 'planilha', 'controle financeiro', 'orçamento', 'metas'],
  authors: [{ name: 'Planilha Financeira' }],
  manifest: '/manifest.webmanifest?v=3',
  icons: {
    icon: [
      { url: '/sheet-icon.svg', type: 'image/svg+xml' },
      { url: '/sheet-icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/sheet-apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Financeira',
  },
  applicationName: 'Planilha Financeira',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" data-theme="dark" className={inter.variable}>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
