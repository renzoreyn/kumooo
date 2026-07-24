import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  transpilePackages: ["@kumooo/ui", "@kumooo/theme-packs"],
};

export default nextConfig;

initOpenNextCloudflareForDev();
