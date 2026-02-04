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

// Custom resolver to handle monorepo package resolution
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle @memoguard packages
  if (moduleName === '@memoguard/shared') {
    return {
      filePath: path.resolve(monorepoRoot, 'packages/shared/index.ts'),
      type: 'sourceFile',
    };
  }
  if (moduleName === '@memoguard/supabase') {
    return {
      filePath: path.resolve(monorepoRoot, 'packages/supabase/index.ts'),
      type: 'sourceFile',
    };
  }

  // Force @supabase/supabase-js to resolve from app's node_modules
  if (moduleName === '@supabase/supabase-js') {
    return {
      filePath: path.resolve(projectRoot, 'node_modules/@supabase/supabase-js/dist/index.mjs'),
      type: 'sourceFile',
    };
  }

  // Mock react-native-maps on web - it only works on native
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      filePath: path.resolve(projectRoot, 'src/mocks/react-native-maps.web.tsx'),
      type: 'sourceFile',
    };
  }

  // Default resolution using Metro's built-in resolver
  return context.resolveRequest(context, moduleName, platform);
};

// Make sure .ts and .tsx files are resolved
config.resolver.sourceExts = ['js', 'jsx', 'ts', 'tsx', 'json', 'mjs'];

// Disable package exports resolution which can cause issues with some packages
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
