import { useLocation } from "@remix-run/react"
import { getPathLocale } from "~/utils/locale-path"

/**
 * 現在の言語を取得する
 */
export function useLocale() {
  const { pathname } = useLocation()

  return getPathLocale(pathname)
}
