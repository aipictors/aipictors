const packageJSON = require("./package.json")

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    appDir: true,
    scrollRestoration: true,
  },
  output: "standalone",
  env: {
    NEXT_PUBLIC_SENTRY_RELEASE: packageJSON.version,
  },
}

module.exports = nextConfig
