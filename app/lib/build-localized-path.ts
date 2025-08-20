import type { Locale } from "~/contexts/locale-context"

// 指定パスにロケール prefix を付与（ja はデフォルトで付与しない）
export function buildLocalizedPath(locale: Locale, path: string): string {
  if (!path.startsWith("/")) {
    return buildLocalizedPath(locale, "/" + path)
  }
  if (locale === "en") {
    if (path === "/") return "/en"
    if (path.startsWith("/en")) return path // 二重付与防止
    return `/en${path}`
  }
  // ja
  if (path.startsWith("/ja/")) return path.replace(/^\/ja/, "")
  return path
}
