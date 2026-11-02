import { useLocation } from "@remix-run/react"
import { useSyncExternalStore } from "react"
import {
  type ContentMode,
  isR18Path,
  readContentMode,
  subscribeContentMode,
} from "~/utils/content-mode"

/**
 * 今のモード（全年齢 / R18）。/r のページならいつも R18
 * サーバーと hydration の間はモードが読めないので URL だけで判断する
 */
export function useContentMode(): ContentMode {
  const location = useLocation()

  const storedMode = useSyncExternalStore(
    subscribeContentMode,
    readContentMode,
    () => "all" as const,
  )

  return isR18Path(location.pathname) ? "r18" : storedMode
}
