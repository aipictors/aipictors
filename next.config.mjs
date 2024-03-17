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
}

export default withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: "nocker",
    project: "aipictors-next",
    authToken: process.env.SENTRY_AUTH_TOKEN,
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
    disableClientWebpackPlugin: true,
    disableServerWebpackPlugin: true,
  },
)
