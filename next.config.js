/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { 
    unoptimized: true,
    domains: ['wazyihwhrrcycvmcwnta.supabase.co']
  },
  experimental: {
    serverActions: true
  }
};

module.exports = nextConfig;