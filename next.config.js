const packageJSON = require("./package.json")

/**
 * @type {import('next').NextConfig}
 **/
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
}

const withBundleAnalyzer = process.env.ANALYZE === 'true'
    ? require('@next/bundle-analyzer')({ enabled: true })
    : (config) => config;

module.exports = withBundleAnalyzer({})
module.exports = nextConfig
