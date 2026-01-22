import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Allow larger CSV uploads (default is 1mb)
    },
  },
};

export default nextConfig;
