import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ourturn.app';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/privacy', '/terms', '/login', '/signup'],
      disallow: [
        '/dashboard/',
        '/api/',
        '/onboarding/',
        '/auth/',
        '/reset-password/',
        '/forgot-password/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
