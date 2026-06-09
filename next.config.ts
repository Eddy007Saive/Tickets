import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow ticket image uploads (sent through a Server Action) up to 10MB;
    // the default Server Action body limit is 1MB.
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
