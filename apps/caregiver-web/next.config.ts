import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Transpile monorepo packages
  transpilePackages: ['@ourturn/shared', '@ourturn/supabase'],

  // Allow Supabase Storage images in next/image
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://js.stripe.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://*.supabase.co https://maps.googleapis.com https://maps.gstatic.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://api.stripe.com",
              "frame-src https://js.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },

  // Experimental settings for monorepo support
  experimental: {
    externalDir: true,
  },

  // Turbopack config for Next.js 16+
  turbopack: {
    resolveAlias: {
      '@ourturn/shared': '../../packages/shared',
      '@ourturn/supabase': '../../packages/supabase',
    },
  },

  // Webpack config for monorepo package resolution (fallback)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@ourturn/shared': path.join(__dirname, '../../packages/shared'),
      '@ourturn/supabase': path.join(__dirname, '../../packages/supabase'),
    };
    return config;
  },
};

export default nextConfig;
