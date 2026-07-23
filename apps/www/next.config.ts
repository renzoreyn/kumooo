import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  transpilePackages: ["@kumooo/ui"],
};

export default nextConfig;

initOpenNextCloudflareForDev();
