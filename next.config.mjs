const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: process.cwd(),
  outputFileTracingIncludes: {
    '/**': ['./node_modules/.prisma/**'],
  },
  outputFileTracingExcludes: {
    '/**': [
      './node_modules/@img/**',
      './node_modules/sharp/**',
      './node_modules/typescript/**',
      './node_modules/caniuse-lite/**',
    ],
  },
};

export default nextConfig;
