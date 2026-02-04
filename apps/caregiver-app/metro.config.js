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

// Map monorepo packages and ensure @supabase resolves from app's node_modules
config.resolver.extraNodeModules = {
  '@memoguard/shared': path.resolve(monorepoRoot, 'packages/shared'),
  '@memoguard/supabase': path.resolve(monorepoRoot, 'packages/supabase'),
  '@supabase/supabase-js': path.resolve(projectRoot, 'node_modules/@supabase/supabase-js'),
  '@supabase/postgrest-js': path.resolve(projectRoot, 'node_modules/@supabase/postgrest-js'),
  '@supabase/auth-js': path.resolve(projectRoot, 'node_modules/@supabase/auth-js'),
  '@supabase/realtime-js': path.resolve(projectRoot, 'node_modules/@supabase/realtime-js'),
  '@supabase/storage-js': path.resolve(projectRoot, 'node_modules/@supabase/storage-js'),
  '@supabase/functions-js': path.resolve(projectRoot, 'node_modules/@supabase/functions-js'),
};

// Custom resolver for web-only mocks
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Mock react-native-maps on web - it only works on native
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      filePath: path.resolve(projectRoot, 'src/mocks/react-native-maps.web.tsx'),
      type: 'sourceFile',
    };
  }

  // Default resolution
  return context.resolveRequest(context, moduleName, platform);
};

// Support .cjs and .mjs files (used by @supabase packages)
config.resolver.sourceExts = ['js', 'jsx', 'ts', 'tsx', 'json', 'cjs', 'mjs'];

// Enable package exports to properly resolve @supabase packages
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
