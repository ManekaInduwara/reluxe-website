import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['framer-motion'],
  images:{
    domains: ["cdn.sanity.io"],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Handle framer-motion compatibility with React 19
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'framer-motion': require.resolve('framer-motion'),
      };
    }
    
    // Add module rules to handle framer-motion properly
    config.module.rules.push({
      test: /\.m?js$/,
      include: /node_modules\/framer-motion/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
  experimental: {
    esmExternals: 'loose',
  },
  /* config options here */
};

export default nextConfig;
