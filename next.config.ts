import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The registry serves the particle runtime's real source file.
  outputFileTracingIncludes: {
    "/r/[name]": ["./components/motion/particles.ts"],
  },
};

export default nextConfig;
