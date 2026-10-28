import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: `output: 'export'` was removed. A static export has no server
  // runtime, so the auth middleware cannot run. We run as a normal Next app
  // (`next dev` / `next start`) and authenticate against the kenlivo-server API.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig; 