import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  webpack: (config) => {
    const rules = config.module.rules.find((r: any) => Array.isArray(r.oneOf))?.oneOf ?? [];
    for (const rule of rules) {
      if (Array.isArray(rule.use)) {
        const hasPostCss = rule.use.some(
          (u: any) => typeof u === "object" && typeof u.loader === "string" && u.loader.includes("postcss-loader")
        );
        if (hasPostCss) {
          rule.use.push({
            loader: "@tailwindcss/turbopack",
          });
        }
      }
    }
    return config;
  },
};

export default nextConfig;
