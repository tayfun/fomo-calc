import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/fomo-calc',
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
