import { vitePlugin, cloudflareDevProxyVitePlugin } from "@remix-run/dev"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import { viteStaticCopy } from "vite-plugin-static-copy"

export default defineConfig({
  worker: {
    format: "es",
  },
  ssr: {
    noExternal: ["react-easy-crop", "tslib"],
  },
  plugins: [
    cloudflareDevProxyVitePlugin(),
    vitePlugin({}),
    tsconfigPaths(),
    viteStaticCopy({
      targets: [
        {
          src: "./node_modules/onnxruntime-web/dist/*.wasm",
          dest: "./debug",
        },
        {
          src: "./public/nsfw_model/*.onnx",
          dest: "./debug",
        },
        {
          src: "./node_modules/onnxruntime-web/dist/*.wasm",
          dest: "./new",
        },
        {
          src: "./public/nsfw_model/*.onnx",
          dest: "./new",
        },
      ],
    }),
  ],
  define: {
    VITE_VERSION: JSON.stringify(process.env.npm_package_version),
  },
})
