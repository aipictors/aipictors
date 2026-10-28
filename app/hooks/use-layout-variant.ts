import { useRouteLoaderData } from "@remix-run/react"
import { useSyncExternalStore } from "react"
import type { LayoutHint } from "~/utils/layout-hint"

/** Tailwind の md */
const DESKTOP_QUERY = "(min-width: 768px)"

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(DESKTOP_QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

const getSnapshot = (): LayoutHint | "both" =>
  window.matchMedia(DESKTOP_QUERY).matches ? "desktop" : "mobile"

/**
 * 画面幅で出し分けている一覧の、どちらを描画するか
 *
 * サーバーでは端末の種類（root の loader の layoutHint）で片方だけを描画する。
 * hydration でも同じものを使い、実際の画面幅と違うときだけ描画し直す（同じなら描画し直さない）。
 * 見た目の出し分けは今まで通り CSS（hidden md:block など）で行うので、両方 true でも表示は崩れない
 */
export const useLayoutVariant = () => {
  const rootData = useRouteLoaderData("root") as
    | { layoutHint?: LayoutHint }
    | undefined
  const serverValue = rootData?.layoutHint ?? "both"
  const value = useSyncExternalStore(subscribe, getSnapshot, () => serverValue)
  return {
    showDesktop: value !== "mobile",
    showMobile: value !== "desktop",
  }
}
