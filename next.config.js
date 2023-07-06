const packageJSON = require("./package.json")

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "standalone",
  env: {
    SENTRY_RELEASE: packageJSON.version,
  },
}

module.exports = nextConfig
