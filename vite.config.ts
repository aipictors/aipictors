import { vitePlugin, cloudflareDevProxyVitePlugin } from "@remix-run/dev"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  worker: {
    format: "es",
  },
  ssr: {
    noExternal: ["react-easy-crop", "tslib"],
  },
  plugins: [
    cloudflareDevProxyVitePlugin(),
    vitePlugin({
      future: {
        unstable_singleFetch: true,
      },
    }),
    tsconfigPaths(),
  ],
  define: {
    VITE_VERSION: JSON.stringify(process.env.npm_package_version),
  },
})
