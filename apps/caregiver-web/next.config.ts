import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Transpile monorepo packages
  transpilePackages: ['@memoguard/shared', '@memoguard/supabase'],

  // Experimental settings for monorepo support
  experimental: {
    externalDir: true,
  },

  // Turbopack config for Next.js 16+
  turbopack: {
    resolveAlias: {
      '@memoguard/shared': '../../packages/shared',
      '@memoguard/supabase': '../../packages/supabase',
    },
  },

  // Webpack config for monorepo package resolution (fallback)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@memoguard/shared': path.join(__dirname, '../../packages/shared'),
      '@memoguard/supabase': path.join(__dirname, '../../packages/supabase'),
    };
    return config;
  },
};

export default nextConfig;
