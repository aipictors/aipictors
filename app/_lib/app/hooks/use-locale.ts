import { useLocation } from "@remix-run/react"

/**
 * 現在の言語を取得する
 * @returns
 */
export const useLocale = () => {
  const { pathname } = useLocation()

  if (pathname.startsWith("/en")) {
    return "en"
  }

  return "ja"
}
