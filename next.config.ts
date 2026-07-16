import type { NextConfig } from "next";

/**
 * Static export for GitHub Pages (user/org Pages at https://h1b0b0.github.io).
 * The GitHub Actions workflow uploads ./out, so `output: "export"` is required.
 * `configure-pages` action injects basePath automatically when needed, so we
 * do NOT hardcode one here.
 */
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Three.js / R3F ship ESM that benefits from transpilation.
  transpilePackages: ["three"],
  // Tolerant trailing slash so static hosts resolve deep links cleanly.
  trailingSlash: true,
};

export default nextConfig;
