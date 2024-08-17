import { useLocation } from "@remix-run/react"

/**
 * 現在の言語を取得する
 */
export function useLocale() {
  const { pathname } = useLocation()

  if (pathname.startsWith("/en")) {
    return "en"
  }

  return "ja"
}
