import { useLocation } from "@remix-run/react"

export type TranslationFn = (jaText: string, enText?: string) => string

export function useTranslation(): TranslationFn {
  const { pathname } = useLocation()

  // パスに基づいて言語を決定
  const locale = pathname.startsWith("/en") ? "en" : "ja"

  // locale に基づいて適切なテキストを返す関数
  const t: TranslationFn = (jaText: string, enText?: string): string => {
    return locale === "en" ? (enText ?? jaText) : jaText
  }

  return t
}
