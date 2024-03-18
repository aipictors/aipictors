// @ts-check
import { withSentryConfig } from "@sentry/nextjs"

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
}

export default withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: "nocker",
    project: "aipictors-web",
    authToken: process.env.SENTRY_AUTH_TOKEN,
  },
  {
    tunnelRoute: "/monitoring",
    hideSourceMaps: false,
  },
)
