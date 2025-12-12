import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    DATA_DIR: process.env.DATA_DIR || '',
  },
  // Ensure server-side code can access environment variables
  serverRuntimeConfig: {
    DATA_DIR: process.env.DATA_DIR || '',
  },
  // Enable instrumentation for cleanup scheduler
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
