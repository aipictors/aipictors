/**
 * 全年齢と R18 のページを行き来するときの移動先
 */
export const getLocalePrefix = (pathname: string) => {
  const localeMatch = pathname.match(/^\/(en)(?=\/|$)/)
  return localeMatch ? `/${localeMatch[1]}` : ""
}

export const buildSensitiveHomePath = (pathname: string, search: string) => {
  const localePrefix = getLocalePrefix(pathname)
  const pathWithoutLocale = pathname.slice(localePrefix.length) || "/"
  const params = new URLSearchParams(search)

  if (pathWithoutLocale === "/" || pathWithoutLocale === "/home") {
    params.set("tab", pathWithoutLocale === "/home" ? "home" : "new")
    return `${localePrefix}/r?${params.toString()}`
  }

  if (pathWithoutLocale === "/follow-user-works") {
    params.set("tab", "follow-user")
    return `${localePrefix}/r?${params.toString()}`
  }

  if (pathWithoutLocale === "/follow-tag-works") {
    params.set("tab", "follow-tag")
    return `${localePrefix}/r?${params.toString()}`
  }

  return `${localePrefix}/r${pathWithoutLocale}${search}`
}

export const buildAllAgesPath = (pathname: string, search: string) => {
  const localePrefix = getLocalePrefix(pathname)
  const pathWithoutLocale = pathname.slice(localePrefix.length) || "/"

  if (pathWithoutLocale !== "/r") {
    const pathWithoutR = pathWithoutLocale.replace(/^\/r/, "")
    return `${localePrefix}${pathWithoutR || "/"}${search}`
  }

  const params = new URLSearchParams(search)
  const tab = params.get("tab")
  params.delete("tab")
  const restSearch = params.toString()
  const searchSuffix = restSearch.length > 0 ? `?${restSearch}` : ""

  if (tab === "home") {
    return `${localePrefix}/home${searchSuffix}`
  }

  if (tab === "follow-user") {
    return `${localePrefix}/follow-user-works${searchSuffix}`
  }

  if (tab === "follow-tag") {
    return `${localePrefix}/follow-tag-works${searchSuffix}`
  }

  return `${localePrefix}/${searchSuffix}`
}
