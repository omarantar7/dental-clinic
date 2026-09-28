import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Enables forbidden()/unauthorized() for permission-based page guards.
    authInterrupts: true,
  },
};

export default nextConfig;
