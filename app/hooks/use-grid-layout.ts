import { useRouteLoaderData } from "@remix-run/react"
import { useCallback, useSyncExternalStore } from "react"
import {
  GRID_LAYOUT_COOKIE,
  type GridLayout,
  parseGridLayout,
} from "~/utils/grid-layout"

const listeners = new Set<() => void>()

const subscribe = (onChange: () => void) => {
  listeners.add(onChange)
  return () => listeners.delete(onChange)
}

const getSnapshot = (): GridLayout => parseGridLayout(document.cookie)

/**
 * 作品一覧のサムネイルの並べ方（正方形／元の比率）と、その切り替え
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
