import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin,
} from "@remix-run/dev"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import { viteStaticCopy } from "vite-plugin-static-copy"
import tailwindcss from "@tailwindcss/vite"
import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import type { Plugin } from "vite"

/**
 * クライアントのビルドで出た tailwind.css の中身を build/critical-css-source.json に書き出す。
 * 配信時にページで使うルールだけを HTML に入れるのに使う（app/lib/critical-css.ts・functions/[[path]].ts）
 */
const criticalCssSource = (): Plugin => ({
  name: "aipictors-critical-css-source",
  apply: "build",
  writeBundle(options, bundle) {
    if (!options.dir?.endsWith(join("build", "client"))) return
    for (const file of Object.values(bundle)) {
      if (
        file.type === "asset" &&
        /^assets\/tailwind-[\w-]+\.css$/.test(file.fileName)
      ) {
        const out = join(options.dir, "..", "critical-css-source.json")
        mkdirSync(dirname(out), { recursive: true })
        writeFileSync(
          out,
          JSON.stringify({
            href: `/${file.fileName}`,
            css: String(file.source),
          }),
        )
        return
      }
    }
  },
})

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
    criticalCssSource(),
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
        // どのページでも使う土台のライブラリ（React・Remix・Apollo など）は 1 つのファイルにまとめる。
        // 細かく分かれていると、モバイルの計測で最初の表示が大きく遅れる。
        // React と Apollo を別のファイルに分けると、読み込み順で Apollo が React を見つけられず壊れるので、必ず同じファイルにする
        manualChunks(id) {
          if (
            /node_modules\/(react|react-dom|scheduler|@remix-run|react-router|react-router-dom|turbo-stream|cookie|set-cookie-parser|@apollo|graphql|@wry|optimism|zen-observable|zen-observable-ts|ts-invariant|symbol-observable|@graphql-typed-document-node|rehackt|hoist-non-react-statics|tslib|@tanstack|use-sync-external-store)\//.test(
              id,
            )
          ) {
            return "vendor"
          }
          return undefined
        },
      },
    },
  },
})
