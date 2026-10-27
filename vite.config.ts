import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin,
} from "@remix-run/dev"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import { viteStaticCopy } from "vite-plugin-static-copy"
import tailwindcss from "@tailwindcss/vite"

declare module "@remix-run/cloudflare" {
  interface Future {
    v3_singleFetch: true
  }
}

export default defineConfig({
  worker: {
    format: "es",
  },
  ssr: {
    noExternal: ["react-easy-crop", "tslib"],
  },
  server: {
    hmr: {
      overlay: false,
    },
    fs: {
      strict: false,
    },
  },
  plugins: [
    cloudflareDevProxyVitePlugin(),
    remix({
      future: {
        unstable_optimizeDeps: true,
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
        v3_singleFetch: true,
        v3_routeConfig: true,
      },
    }),
    tsconfigPaths(),
    tailwindcss(),
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
  build: {
    rollupOptions: {
      output: {
        // ハッシュ付きのファイル名にして、/assets/* を長期キャッシュ（immutable）できるようにする。
        // デプロイ直後に古いページが消えたチャンクを読みに行った場合は、root.tsx の vite:preloadError で再読み込みする。
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        // 細かいチャンクが数百個に分かれると、ページを開いたときの modulepreload が多すぎて
        // 回線が遅い端末で表示が遅れる。小さいチャンクはまとめる。
        experimentalMinChunkSize: 120_000,
        // どのページでも使う土台のライブラリは、数十個の小さなファイルに分かれないよう 1 つにまとめる
        // （モバイルの計測では、ファイル数が多いと最初の表示が大きく遅れる）
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined
          if (
            /node_modules\/(react|react-dom|scheduler|@remix-run|react-router|react-router-dom|turbo-stream|@web3-storage\/multipart-parser|cookie|set-cookie-parser)\//.test(
              id,
            )
          ) {
            return "vendor-react"
          }
          if (
            /node_modules\/(@apollo|graphql|@wry|optimism|zen-observable|zen-observable-ts|ts-invariant|symbol-observable|@graphql-typed-document-node|gql\.tada|@0no-co|hoist-non-react-statics|rehackt)\//.test(
              id,
            )
          ) {
            return "vendor-apollo"
          }
          if (
            /node_modules\/(@tanstack|clsx|tailwind-merge|class-variance-authority|sonner|usehooks-ts|@radix-ui\/(react-slot|react-primitive|react-compose-refs|react-context|primitive|react-use-callback-ref|react-use-controllable-state|react-use-layout-effect|react-id|react-presence|react-portal|react-dismissable-layer|react-focus-scope|react-focus-guards|react-use-escape-keydown|number))\//.test(
              id,
            )
          ) {
            return "vendor-base"
          }
          return undefined
        },
      },
    },
  },
})
