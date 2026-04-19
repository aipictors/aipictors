import { useLocation } from "@remix-run/react"
import { getPathLocale } from "~/utils/locale-path"

export type TranslationFn = (jaText: string, enText?: string) => string

export function useTranslation(): TranslationFn {
  const { pathname } = useLocation()

  // パスに基づいて言語を決定
  const locale = getPathLocale(pathname)

  // locale に基づいて適切なテキストを返す関数
  const t: TranslationFn = (jaText: string, enText?: string): string => {
    return locale === "en" ? (enText ?? jaText) : jaText
  }

  return t
}
