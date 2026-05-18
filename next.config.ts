import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin images (e.g. Firebase profile photos)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
