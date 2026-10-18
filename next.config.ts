import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // The Docker image runs .next/standalone/server.js, which carries only the files the server needs.
  output: "standalone",
};

export default withNextIntl(nextConfig);
