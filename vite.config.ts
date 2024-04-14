import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  ssr: {
    noExternal: ["react-easy-crop", "tslib"],
  },
  plugins: [remixCloudflareDevProxy(), remix(), tsconfigPaths()],
})
