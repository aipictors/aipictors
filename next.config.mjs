// @ts-check
import { withSentryConfig } from "@sentry/nextjs"
import packageJSON from "./package.json" assert { type: "json" }

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // ppr: true, // Can only be enabled in canary
    scrollRestoration: true,
  },
  output: "standalone",
  // @next/imageの設定 画像最適化なし
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.aipictors.com",
        port: "",
      },
    ],
    unoptimized: true,
  },
  // logging: {
  //   fetches: {
  //     fullUrl: true,
  //   },
  // },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.node$/,
      loader: "node-loader",
    })
    return config
  },
  productionBrowserSourceMaps: true,
  env: {
    NEXT_PUBLIC_VERSION: packageJSON.version,
  },
  /**
   * 32MB
   */
  cacheMaxMemorySize: 2 ** 20 * 32,
}

export default withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: "nocker",
    project: "aipictors-web",
    authToken: process.env.SENTRY_AUTH_TOKEN,
    release: packageJSON.version,
  },
  {
    tunnelRoute: "/monitoring",
    hideSourceMaps: false,
  },
)
