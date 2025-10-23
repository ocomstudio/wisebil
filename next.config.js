/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: [
      "https://6000-firebase-studio-1753596464106.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev"
    ]
  },
  env: {
    NEXT_PUBLIC_CINETPAY_API_KEY: '115005263965f879c0ae4c05.63857515',
    NEXT_PUBLIC_CINETPAY_SITE_ID: '105905440'
  }
};

module.exports = withPWA(nextConfig);
