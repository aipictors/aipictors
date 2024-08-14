/**
 * 多言語化に対応したリンクを返す
 */
export function toLocalHref(path: `/${string}`, locale: string) {
  if (!path.startsWith("/")) {
    throw new Error("Invalid pathname")
  }

  if (locale === "en") {
    return `/en${path}`
  }

  if (locale === "ja" && path === "/en") {
    return "/"
  }

  if (locale === "ja") {
    return path.replace("/en/", "/")
  }

  return path
}
