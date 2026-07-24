import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  transpilePackages: ["@kumooo/ui", "@kumooo/plans"],
  webpack(config) {
    config.module.rules.push({
      test: /\.md$/,
      type: "asset/source",
    });
    return config;
  },
  async redirects() {
    return [
      {
        source: "/start",
        destination: "/pricing",
        permanent: true,
      },
      {
        source: "/learn",
        destination: "https://docs.kumooo.dev/docs/learn",
        permanent: true,
      },
      {
        source: "/learn/:slug*",
        destination: "https://docs.kumooo.dev/docs/learn/:slug*",
        permanent: true,
      },
      {
        source: "/setup",
        destination: "https://docs.kumooo.dev/docs/setup",
        permanent: true,
      },
      {
        source: "/docs",
        destination: "https://docs.kumooo.dev/docs",
        permanent: true,
      },
      {
        source: "/docs/:path*",
        destination: "https://docs.kumooo.dev/docs/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
