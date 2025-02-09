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

module.exports = nextConfig;