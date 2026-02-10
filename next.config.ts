import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
    serverComponentsExternalPackages: ['fluent-ffmpeg', 'ffmpeg-static'],
  },
};

export default nextConfig;
