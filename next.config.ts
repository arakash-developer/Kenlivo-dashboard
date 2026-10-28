import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: `output: 'export'` was removed. A static export has no server
  // runtime, so middleware / API routes / server-side auth cannot run.
  // Real auth (better-auth) requires the Node server, so we run as a normal
  // Next app (`next dev` / `next start`).
  trailingSlash: true,
  // Keep trailing slashes on generated links, but don't force-redirect
  // incoming requests. better-auth's API routes have no trailing slash, and
  // the 308 redirect would otherwise break them.
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig; 