import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Transpile monorepo packages
  transpilePackages: ['@memoguard/shared', '@memoguard/supabase'],
  // Turbopack configuration (Next.js 16+ default bundler)
  turbopack: {
    // Set root to this project directory, not the monorepo root
    root: __dirname,
    resolveAlias: {
      '@memoguard/shared': path.resolve(__dirname, '../../packages/shared'),
      '@memoguard/supabase': path.resolve(__dirname, '../../packages/supabase'),
    },
  },
};

export default nextConfig;
