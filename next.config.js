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
      // ppr: true, //Can only be enabled in canary
      scrollRestoration: true,
    },
    output: "standalone",
    env: {
      NEXT_PUBLIC_SENTRY_RELEASE: packageJSON.version,
    },
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
  }
  if (process.env.ANALYZE === "true") {
    const withBundleAnalyzer = require("@next/bundle-analyzer")({
      enabled: true,
    })
    return withBundleAnalyzer(nextConfig)
  }
  return nextConfig
}
