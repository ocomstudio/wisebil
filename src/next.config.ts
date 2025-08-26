import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
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
      'https://6000-firebase-studio-1753596464106.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev',
    ],
  },
  env: {
    NEXT_PUBLIC_CINETPAY_API_KEY: process.env.NEXT_PUBLIC_CINETPAY_API_KEY,
    NEXT_PUBLIC_CINETPAY_SITE_ID: process.env.NEXT_PUBLIC_CINETPAY_SITE_ID,
  }
};

export default nextConfig;
