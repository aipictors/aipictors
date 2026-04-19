export type SupportedLocale = "ja" | "en"

type LocalePathState = {
  locale: SupportedLocale
  isSensitive: boolean
  remainder: string
}

const normalizeRemainder = (remainder: string) => {
  if (remainder.length === 0 || remainder === "/") {
    return "/"
  }

  return remainder.startsWith("/") ? remainder : `/${remainder}`
}

export const parseLocalePath = (pathname: string): LocalePathState => {
  const segments = pathname.split("/").filter(Boolean)

  let locale: SupportedLocale = "ja"
  let isSensitive = false

  const remainingSegments = [...segments]

  if (remainingSegments[0] === "r") {
    isSensitive = true
    remainingSegments.shift()
  }

  if (remainingSegments[0] === "en" || remainingSegments[0] === "ja") {
    locale = remainingSegments[0] === "en" ? "en" : "ja"
    remainingSegments.shift()
  }

  if (remainingSegments[0] === "r") {
    isSensitive = true
    remainingSegments.shift()
  }

  const remainder = normalizeRemainder(remainingSegments.join("/"))

  return {
    locale,
    isSensitive,
    remainder,
  }
}

export const buildLocalePath = (
  locale: SupportedLocale,
  pathname: string,
) => {
  const { isSensitive, remainder } = parseLocalePath(pathname)

  const segments: string[] = []

  if (locale === "en") {
    segments.push("en")
  }

  if (isSensitive) {
    segments.push("r")
  }

  if (remainder !== "/") {
    segments.push(...remainder.slice(1).split("/"))
  }

  return segments.length > 0 ? `/${segments.join("/")}` : "/"
}

export const normalizeLocalePath = (pathname: string) => {
  const { locale } = parseLocalePath(pathname)
  return buildLocalePath(locale, pathname)
}

export const getPathLocale = (pathname: string): SupportedLocale => {
  return parseLocalePath(pathname).locale
}

export const buildAlternateLocaleUrls = (
  pathname: string,
  siteUrl: string,
  search = "",
) => {
  const normalizedSearch = search ?? ""
  const jaPath = buildLocalePath("ja", pathname)
  const enPath = buildLocalePath("en", pathname)

  return {
    canonical:
      `${siteUrl}${normalizeLocalePath(pathname)}${normalizedSearch}`,
    ja: `${siteUrl}${jaPath}${normalizedSearch}`,
    en: `${siteUrl}${enPath}${normalizedSearch}`,
    xDefault: `${siteUrl}${jaPath}${normalizedSearch}`,
  }
}