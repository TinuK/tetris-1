import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker containerization
  output: 'standalone',
  // Disable telemetry for production builds
  turbopack: {
    // Turbopack configuration can be added here if needed
  }
};

export default nextConfig;
