// @ts-check
import { withSentryConfig } from "@sentry/nextjs"
import packageJSON from "./package.json" assert { type: "json" }

/**
 * @type {import('next').NextConfig}
 */

// Configuration as an asynchronous function for dynamic handling
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    // ppr: true, // Can only be enabled in canary
    scrollRestoration: true,
  },
  webpack(config) {
    config.externals = [...config.externals, { canvas: "canvas" }]
    return config
  },
  output: "standalone",
  env: {
    NEXT_PUBLIC_SENTRY_RELEASE: packageJSON.version,
  },
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
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  sentry: {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
  },
}

const sentryWebpackPluginOptions = {
  silent: true,
  org: "nocker",
  project: "aipictors-next",
}

// Wrap Sentry configuration as ESM is asynchronous
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions)
