/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "pdfjs-dist"],
    webpackBuildWorker: false,
  },
  outputFileTracing: false,
};

export default nextConfig;
