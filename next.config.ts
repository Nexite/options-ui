import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'stocks.nikhilgarg.com',
      },
    ],
  },
};

export default nextConfig;
