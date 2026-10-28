import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds a plain HTML site into out/ (used for GitHub Pages).
// NEXT_PUBLIC_BASE_PATH is the sub-path the site is served from, e.g. "/aac-hub".
const staticExport = !!process.env.STATIC_EXPORT;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  ...(staticExport && { output: "export", trailingSlash: true, images: { unoptimized: true } }),
  basePath,
};

export default nextConfig;
