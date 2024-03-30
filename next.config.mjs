// import million from "million/compiler"
// @ts-check
// import { withSentryConfig } from "@sentry/nextjs"
import packageJSON from "./package.json" assert { type: "json" }

/** @type {import('next').NextConfig} **/
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    scrollRestoration: true,
  },
  output: "standalone",
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
  productionBrowserSourceMaps: true,
  env: {
    NEXT_PUBLIC_VERSION: packageJSON.version,
  },
  cacheMaxMemorySize: 0,
  /**
   * Vercel以外の環境ではこの設定が必要です
   * https://nextjs.org/docs/app/api-reference/next-config-js/incrementalCacheHandlerPath
   */
  cacheHandler:
    process.env.NODE_ENV === "production" ? "./cache-handler.mjs" : undefined,
}

// const sentryOptions = {
//   silent: true,
//   org: "nocker",
//   project: "aipictors-web",
//   authToken: process.env.SENTRY_AUTH_TOKEN,
//   release: packageJSON.version
// };
// const sentryEnhancedConfig = withSentryConfig(nextConfig, sentryOptions, {
//   tunnelRoute: "/monitoring",
//   hideSourceMaps: false,
// });

// const millionConfig = {
//   auto: { rsc: true },
// }

// @ts-ignore
// export default million.next(nextConfig, millionConfig)

export default nextConfig