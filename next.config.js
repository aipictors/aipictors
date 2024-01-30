const packageJSON = require("./package.json")

/**
 * @type {import('next').NextConfig}
 **/

module.exports = () => {
  const nextConfig = {
    reactStrictMode: false,
    swcMinify: true,
    eslint: {
      ignoreDuringBuilds: true,
    },
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
  }
  if (process.env.ANALYZE === "true") {
    const withBundleAnalyzer = require("@next/bundle-analyzer")({
      enabled: true,
    })
    return withBundleAnalyzer(nextConfig)
  }
  return nextConfig
}


// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: "nocker",
    project: "aipictors-next",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors.
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }
);
