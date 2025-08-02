import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    transpilePackages: ['framer-motion'],
  images:{
    domains: ["cdn.sanity.io"],
  }
  /* config options here */
};

export default nextConfig;
