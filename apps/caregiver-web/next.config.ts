import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Transpile monorepo packages
  transpilePackages: ['@memoguard/shared', '@memoguard/supabase'],

  // Experimental settings for monorepo support
  experimental: {
    externalDir: true,
  },

  // Webpack config for monorepo package resolution
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
