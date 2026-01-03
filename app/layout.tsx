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
  themeColor: '#667eea',
};

export const metadata: Metadata = {
  title: 'Planilha Financeira v2',
  description: 'Gerencie suas finanças pessoais de forma simples e eficiente',
  keywords: ['finanças', 'planilha', 'controle financeiro', 'orçamento', 'metas'],
  authors: [{ name: 'Planilha Financeira' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
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
