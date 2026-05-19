import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow up to 30 MB request bodies (audio file uploads)
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
};

export default nextConfig;
