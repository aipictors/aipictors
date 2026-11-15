import { useRouteLoaderData } from "@remix-run/react"
import { useCallback, useSyncExternalStore } from "react"
import {
  GRID_LAYOUT_COOKIE,
  type GridLayout,
  parseGridLayout,
  toDefaultGridLayout,
} from "~/utils/grid-layout"

const listeners = new Set<() => void>()

/** Tailwind の md（app/hooks/use-layout-variant.ts と同じ） */
const DESKTOP_QUERY = "(min-width: 768px)"

const subscribe = (onChange: () => void) => {
  listeners.add(onChange)
  // 選んでいない人の既定は画面幅で変わる
  const query = window.matchMedia(DESKTOP_QUERY)
  query.addEventListener("change", onChange)
  return () => {
    listeners.delete(onChange)
    query.removeEventListener("change", onChange)
  }
}

const getSnapshot = (): GridLayout =>
  parseGridLayout(
    document.cookie,
    toDefaultGridLayout(
      window.matchMedia(DESKTOP_QUERY).matches ? "desktop" : "mobile",
    ),
  )

/**
 * 作品一覧のサムネイルの並べ方（正方形／元の比率）と、その切り替え
 * 選んでいない人はスマホが元の比率（石垣状）、PC が正方形
 *
 * サーバーでは root の loader が cookie から読んだ値で描画し、hydration でも同じ値を使う
 */
export const useGridLayout = () => {
  const rootData = useRouteLoaderData("root") as
    | { gridLayout?: GridLayout }
    | undefined
  const serverValue = rootData?.gridLayout ?? "square"

  const gridLayout = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => serverValue,
  )

  const setGridLayout = useCallback((value: GridLayout) => {
    document.cookie = `${GRID_LAYOUT_COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`
    for (const listener of listeners) listener()
  }, [])

  return { gridLayout, setGridLayout }
}
