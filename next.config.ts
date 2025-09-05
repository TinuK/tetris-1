import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker containerization
  output: 'standalone',
  // Disable telemetry for production builds
  experimental: {
    // Enable Turbopack for faster builds
    turbo: {
      // Turbopack configuration can be added here if needed
    }
  }
};

export default nextConfig;
