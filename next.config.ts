import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  // Standalone output is for the Docker/self-hosted image (see Dockerfile).
  // On Vercel it must be off: Vercel's build adapter does not emit the
  // `.next/next-server.js.nft.json` trace that standalone copying reads, and
  // the build fails with ENOENT. Vercel sets VERCEL=1 during its builds.
  output: process.env.VERCEL ? undefined : "standalone",
  devIndicators: false,
};

export default withNextIntl(nextConfig);
