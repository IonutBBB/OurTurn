const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = [monorepoRoot];

// Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Resolve the shared packages as if they were local
config.resolver.extraNodeModules = {
  '@memoguard/shared': path.resolve(monorepoRoot, 'packages/shared'),
  '@memoguard/supabase': path.resolve(monorepoRoot, 'packages/supabase'),
};

// Make sure .ts and .tsx files are resolved
config.resolver.sourceExts = ['js', 'jsx', 'ts', 'tsx', 'json'];

module.exports = config;
