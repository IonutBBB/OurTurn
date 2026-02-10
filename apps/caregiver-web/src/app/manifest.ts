import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OurTurn',
    short_name: 'OurTurn',
    description: 'Daily care coordination for families living with dementia',
    start_url: '/',
    display: 'standalone',
    theme_color: '#B85A2F',
    background_color: '#FAF7F2',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
