import { flatRoutes } from "@remix-run/fs-routes"
import type { RouteConfig } from "@remix-run/route-config"

// 開発でしか使わないページ。本番のビルドに onnxruntime（wasm 21MB）が入らないように外す
const routes: RouteConfig = flatRoutes({
  ignoredRouteFiles:
    import.meta.env.MODE === "production" ? ["**/*.debug.nsfw"] : [],
})

export default routes
