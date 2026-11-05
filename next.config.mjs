/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    webpackBuildWorker: false,
  },
  outputFileTracing: false,
};

export default nextConfig;
