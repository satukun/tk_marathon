/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/chunks\/.*$/],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/wazyihwhrrcycvmcwnta\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 // 24時間
        }
      }
    },
    {
      urlPattern: /\/_next\/image\?url=.+/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 60 * 60 * 24 * 30 // 30日
        }
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-images',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 60 * 60 * 24 * 30 // 30日
        }
      }
    }
  ]
});

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
  },
  webpack: (config, { isServer }) => {
    // face-api.jsの設定
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        crypto: false,
        stream: false,
        path: false
      };
    }

    // face-api.jsのトランスパイル設定を追加
    config.module.rules.push({
      test: /face-api\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel']
        }
      }
    });

    return config;
  }
};

module.exports = withPWA(nextConfig);