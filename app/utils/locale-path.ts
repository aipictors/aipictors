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

/**
 * ブラウザの言語設定（Accept-Language）から表示言語を決める。
 * 希望順に見て、日本語と英語のうち先にある方。どちらもない海外のブラウザは英語にする。
 * 言語設定を送らない検索エンジンなどは日本語（/en は /en のまま読める）
 */
export const toLocaleFromAcceptLanguage = (
  acceptLanguage: string | null | undefined,
): SupportedLocale => {
  const languages = (acceptLanguage ?? "")
    .toLowerCase()
    .split(",")
    .map((item, index) => {
      const [tag, ...params] = item.trim().split(";")
      const q = params
        .map((param) => param.trim().match(/^q=([\d.]+)$/)?.[1])
        .find((value) => value !== undefined)
      return {
        language: tag.trim().split("-")[0],
        q: q === undefined ? 1 : Number(q),
        index,
      }
    })
    .filter((item) => item.language !== "" && item.language !== "*" && item.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index)

  if (languages.length === 0) return "ja"
  const known = languages.find(
    (item) => item.language === "ja" || item.language === "en",
  )
  return known?.language === "ja" ? "ja" : "en"
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

/**
 * canonical に残すクエリ（並び替え・絞り込み・トラッキング用のクエリは外して、
 * 同じ内容の URL を 1 つにまとめる）。ページ番号だけは別の内容なので残す。
 */
const toCanonicalSearch = (search: string, pathname = "") => {
  // 作品ページには一覧のページ番号がないので、?page= も外す
  if (
    /^\/(?:en\/)?(?:r\/)?posts\/(?:\d+|[0-9a-f]{8}-[0-9a-f-]{27})\/?$/i.test(
      pathname,
    )
  ) {
    return ""
  }
  // ジャンルの入口は ?page= でもサーバーの HTML が同じ（ページ送りは画面で読む）ので 1 つにまとめる
  if (/^\/(?:en\/)?posts\/(?:2d|2\.5d|3d)\/?$/.test(pathname)) {
    return ""
  }
  const params = new URLSearchParams(search)
  const page = Number.parseInt(params.get("page") ?? "", 10)
  if (Number.isFinite(page) && page > 0) {
    return `?page=${page}`
  }
  return ""
}

/**
 * 全年齢版と同じ内容の R18 のページ（canonical を全年齢版にまとめる）
 * 画像生成は /r/generation でも同じ画面なので、検索の評価を /generation に集める
 */
const SENSITIVE_ALIAS_PATHS = new Set(["/generation"])

/**
 * 日本語だけのページ（解説記事）。英語の URL でも開けるが、canonical は日本語の URL にし、
 * hreflang で英語版を案内しない
 */
const JA_ONLY_PATH = /^\/guides(?:\/|$)/

export const isJaOnlyPath = (pathname: string) => {
  const { isSensitive, remainder } = parseLocalePath(pathname)
  return !isSensitive && JA_ONLY_PATH.test(remainder)
}

const toCanonicalPath = (pathname: string) => {
  const { locale, isSensitive, remainder } = parseLocalePath(pathname)
  if (isJaOnlyPath(pathname)) {
    return buildLocalePath("ja", remainder)
  }
  if (isSensitive && SENSITIVE_ALIAS_PATHS.has(remainder)) {
    return buildLocalePath(locale, remainder === "/" ? "/" : remainder)
  }
  return normalizeLocalePath(pathname)
}

export const buildAlternateLocaleUrls = (
  rawPathname: string,
  siteUrl: string,
  search = "",
) => {
  const pathname = toCanonicalPath(rawPathname)
  const normalizedSearch = toCanonicalSearch(search ?? "", pathname)
  const jaPath = buildLocalePath("ja", pathname)
  const enPath = buildLocalePath("en", pathname)

  return {
    /** 日本語だけのページ。hreflang を出さない */
    isJaOnly: isJaOnlyPath(pathname),
    canonical:
      `${siteUrl}${normalizeLocalePath(pathname)}${normalizedSearch}`,
    ja: `${siteUrl}${jaPath}${normalizedSearch}`,
    en: `${siteUrl}${enPath}${normalizedSearch}`,
    // 日本語でも英語でもない地域の人に出す URL。日本語より英語の方が読める人が多い
    xDefault: `${siteUrl}${enPath}${normalizedSearch}`,
  }
}