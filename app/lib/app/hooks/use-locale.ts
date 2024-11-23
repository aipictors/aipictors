import { useLocation } from "react-router"

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
