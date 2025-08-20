import { useLocation } from "@remix-run/react"
import { useLocaleContext } from "~/contexts/locale-context"
import { getLocaleFromPath } from "~/lib/get-locale-from-path"

export function useLocale() {
  const { locale } = useLocaleContext()
  // コンテキストがデフォルト (ja) の場合でも pathname に /en があれば優先（初期導入段階の安全策）
  const { pathname } = useLocation()
  const pathLocale = getLocaleFromPath(pathname)
  if (locale !== pathLocale) return pathLocale
  return locale
}
