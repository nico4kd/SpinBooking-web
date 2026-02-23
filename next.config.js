/** @type {import('next').NextConfig} */
const withPWA = require('@ducanh2912/next-pwa').default;

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@spinbooking/types', '@spinbooking/validation', '@spinbooking/utils'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

module.exports = withPWA({
  dest: 'public',
  cacheOnFrontendNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NEXT_PUBLIC_PWA_DISABLED === 'true',
  fallbacks: {
    document: '/offline',
  },
})(nextConfig);
