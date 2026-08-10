import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Internal design-system reference, intentionally not linked from nav.
      { source: "/designsystem", destination: "/designsystem.html" },
    ];
  },
};

export default nextConfig;
