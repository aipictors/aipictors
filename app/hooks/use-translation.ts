import { useLocation } from "react-router"

export function useTranslation() {
  const { pathname } = useLocation()

  // パスに基づいて言語を決定
  const locale = pathname.startsWith("/en") ? "en" : "ja"

  // locale に基づいて適切なテキストを返す関数
  const t = (jaText: string, enText: string) => {
    return locale === "en" ? enText : jaText
  }

  return t
}
