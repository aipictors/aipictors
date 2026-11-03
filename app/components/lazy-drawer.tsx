import { lazy } from "react"

const load = () => import("~/components/ui/drawer")

/**
 * スマホのシート（vaul）を、開くときに読み込むための部品。Suspense の中で使う。
 * トリガーは普通のボタンにして、最初に押されたときに描画する
 */
export const LazyDrawer = lazy(() =>
  load().then((module) => ({ default: module.Drawer })),
)
export const LazyDrawerContent = lazy(() =>
  load().then((module) => ({ default: module.DrawerContent })),
)
export const LazyDrawerClose = lazy(() =>
  load().then((module) => ({ default: module.DrawerClose })),
)
export const LazyDrawerTitle = lazy(() =>
  load().then((module) => ({ default: module.DrawerTitle })),
)
export const LazyDrawerDescription = lazy(() =>
  load().then((module) => ({ default: module.DrawerDescription })),
)
