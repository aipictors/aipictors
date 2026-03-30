// vite.config.ts
import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin
} from "file:///Users/nakatsuka-k/Documents/GitHub/aipictors-all/aipictors/node_modules/@remix-run/dev/dist/index.js";
import { defineConfig } from "file:///Users/nakatsuka-k/Documents/GitHub/aipictors-all/aipictors/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///Users/nakatsuka-k/Documents/GitHub/aipictors-all/aipictors/node_modules/vite-tsconfig-paths/dist/index.js";
import { viteStaticCopy } from "file:///Users/nakatsuka-k/Documents/GitHub/aipictors-all/aipictors/node_modules/vite-plugin-static-copy/dist/index.js";
import tailwindcss from "file:///Users/nakatsuka-k/Documents/GitHub/aipictors-all/aipictors/node_modules/@tailwindcss/vite/dist/index.mjs";
var vite_config_default = defineConfig({
  worker: {
    format: "es"
  },
  ssr: {
    noExternal: ["react-easy-crop", "tslib"]
  },
  server: {
    hmr: {
      overlay: false
    },
    fs: {
      strict: false
    }
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
        v3_routeConfig: true
      }
    }),
    tsconfigPaths(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: "./node_modules/onnxruntime-web/dist/*.wasm",
          dest: "./debug"
        },
        {
          src: "./public/nsfw_model/*.onnx",
          dest: "./debug"
        },
        {
          src: "./node_modules/onnxruntime-web/dist/*.wasm",
          dest: "./new"
        },
        {
          src: "./public/nsfw_model/*.onnx",
          dest: "./new"
        }
      ]
    })
  ],
  define: {
    VITE_VERSION: JSON.stringify(process.env.npm_package_version)
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]"
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbmFrYXRzdWthLWsvRG9jdW1lbnRzL0dpdEh1Yi9haXBpY3RvcnMtYWxsL2FpcGljdG9yc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL25ha2F0c3VrYS1rL0RvY3VtZW50cy9HaXRIdWIvYWlwaWN0b3JzLWFsbC9haXBpY3RvcnMvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL25ha2F0c3VrYS1rL0RvY3VtZW50cy9HaXRIdWIvYWlwaWN0b3JzLWFsbC9haXBpY3RvcnMvdml0ZS5jb25maWcudHNcIjtpbXBvcnQge1xuICB2aXRlUGx1Z2luIGFzIHJlbWl4LFxuICBjbG91ZGZsYXJlRGV2UHJveHlWaXRlUGx1Z2luLFxufSBmcm9tIFwiQHJlbWl4LXJ1bi9kZXZcIlxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIlxuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSBcInZpdGUtdHNjb25maWctcGF0aHNcIlxuaW1wb3J0IHsgdml0ZVN0YXRpY0NvcHkgfSBmcm9tIFwidml0ZS1wbHVnaW4tc3RhdGljLWNvcHlcIlxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gXCJAdGFpbHdpbmRjc3Mvdml0ZVwiXG5cbmRlY2xhcmUgbW9kdWxlIFwiQHJlbWl4LXJ1bi9jbG91ZGZsYXJlXCIge1xuICBpbnRlcmZhY2UgRnV0dXJlIHtcbiAgICB2M19zaW5nbGVGZXRjaDogdHJ1ZVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHdvcmtlcjoge1xuICAgIGZvcm1hdDogXCJlc1wiLFxuICB9LFxuICBzc3I6IHtcbiAgICBub0V4dGVybmFsOiBbXCJyZWFjdC1lYXN5LWNyb3BcIiwgXCJ0c2xpYlwiXSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgaG1yOiB7XG4gICAgICBvdmVybGF5OiBmYWxzZSxcbiAgICB9LFxuICAgIGZzOiB7XG4gICAgICBzdHJpY3Q6IGZhbHNlLFxuICAgIH0sXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICBjbG91ZGZsYXJlRGV2UHJveHlWaXRlUGx1Z2luKCksXG4gICAgcmVtaXgoe1xuICAgICAgZnV0dXJlOiB7XG4gICAgICAgIHVuc3RhYmxlX29wdGltaXplRGVwczogdHJ1ZSxcbiAgICAgICAgdjNfZmV0Y2hlclBlcnNpc3Q6IHRydWUsXG4gICAgICAgIHYzX3JlbGF0aXZlU3BsYXRQYXRoOiB0cnVlLFxuICAgICAgICB2M190aHJvd0Fib3J0UmVhc29uOiB0cnVlLFxuICAgICAgICB2M19sYXp5Um91dGVEaXNjb3Zlcnk6IHRydWUsXG4gICAgICAgIHYzX3NpbmdsZUZldGNoOiB0cnVlLFxuICAgICAgICB2M19yb3V0ZUNvbmZpZzogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSksXG4gICAgdHNjb25maWdQYXRocygpLFxuICAgIHRhaWx3aW5kY3NzKCksXG4gICAgdml0ZVN0YXRpY0NvcHkoe1xuICAgICAgdGFyZ2V0czogW1xuICAgICAgICB7XG4gICAgICAgICAgc3JjOiBcIi4vbm9kZV9tb2R1bGVzL29ubnhydW50aW1lLXdlYi9kaXN0Lyoud2FzbVwiLFxuICAgICAgICAgIGRlc3Q6IFwiLi9kZWJ1Z1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgc3JjOiBcIi4vcHVibGljL25zZndfbW9kZWwvKi5vbm54XCIsXG4gICAgICAgICAgZGVzdDogXCIuL2RlYnVnXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBzcmM6IFwiLi9ub2RlX21vZHVsZXMvb25ueHJ1bnRpbWUtd2ViL2Rpc3QvKi53YXNtXCIsXG4gICAgICAgICAgZGVzdDogXCIuL25ld1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgc3JjOiBcIi4vcHVibGljL25zZndfbW9kZWwvKi5vbm54XCIsXG4gICAgICAgICAgZGVzdDogXCIuL25ld1wiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KSxcbiAgXSxcbiAgZGVmaW5lOiB7XG4gICAgVklURV9WRVJTSU9OOiBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudi5ucG1fcGFja2FnZV92ZXJzaW9uKSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6IFwiYXNzZXRzL1tuYW1lXS5qc1wiLFxuICAgICAgICBjaHVua0ZpbGVOYW1lczogXCJhc3NldHMvW25hbWVdLmpzXCIsXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0uW2V4dF1cIixcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW1XO0FBQUEsRUFDalcsY0FBYztBQUFBLEVBQ2Q7QUFBQSxPQUNLO0FBQ1AsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxtQkFBbUI7QUFDMUIsU0FBUyxzQkFBc0I7QUFDL0IsT0FBTyxpQkFBaUI7QUFReEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsUUFBUTtBQUFBLElBQ04sUUFBUTtBQUFBLEVBQ1Y7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNILFlBQVksQ0FBQyxtQkFBbUIsT0FBTztBQUFBLEVBQ3pDO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixLQUFLO0FBQUEsTUFDSCxTQUFTO0FBQUEsSUFDWDtBQUFBLElBQ0EsSUFBSTtBQUFBLE1BQ0YsUUFBUTtBQUFBLElBQ1Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCw2QkFBNkI7QUFBQSxJQUM3QixNQUFNO0FBQUEsTUFDSixRQUFRO0FBQUEsUUFDTix1QkFBdUI7QUFBQSxRQUN2QixtQkFBbUI7QUFBQSxRQUNuQixzQkFBc0I7QUFBQSxRQUN0QixxQkFBcUI7QUFBQSxRQUNyQix1QkFBdUI7QUFBQSxRQUN2QixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxNQUNsQjtBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsY0FBYztBQUFBLElBQ2QsWUFBWTtBQUFBLElBQ1osZUFBZTtBQUFBLE1BQ2IsU0FBUztBQUFBLFFBQ1A7QUFBQSxVQUNFLEtBQUs7QUFBQSxVQUNMLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsS0FBSztBQUFBLFVBQ0wsTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxLQUFLO0FBQUEsVUFDTCxNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLEtBQUs7QUFBQSxVQUNMLE1BQU07QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLGNBQWMsS0FBSyxVQUFVLFFBQVEsSUFBSSxtQkFBbUI7QUFBQSxFQUM5RDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsTUFDbEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
