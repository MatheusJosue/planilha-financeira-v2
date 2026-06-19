import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Planilha Financeira v2',
    short_name: 'Financeira',
    description: 'Gerencie suas finanças pessoais de forma simples e eficiente.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0f0c29',
    theme_color: '#667eea',
    categories: ['finance', 'productivity'],
    lang: 'pt-BR',
    icons: [
      {
        src: '/sheet-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/sheet-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/sheet-maskable-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
