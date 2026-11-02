/**
 * 全年齢 / R18 のどちらを見ているか（モード）
 *
 * R18 のページは URL の先頭が /r だが、生成・設定・作品ページなどには /r のページがなく、
 * URL だけで判断すると、そこを通ったとたんに全年齢に戻っていた。
 * モードは切り替えたときだけ変わるものとして覚えておき、/r のページがある移動先はそちらへ置き換える。
 */
const CONTENT_MODE_KEY = "aipictors.contentMode"

export type ContentMode = "all" | "r18"

const MODE_CHANGE_EVENT = "aipictors:content-mode"

export const readContentMode = (): ContentMode => {
  try {
    return localStorage.getItem(CONTENT_MODE_KEY) === "r18" ? "r18" : "all"
  } catch {
    return "all"
  }
}

export const writeContentMode = (mode: ContentMode) => {
  try {
    if (readContentMode() === mode) return
    localStorage.setItem(CONTENT_MODE_KEY, mode)
    window.dispatchEvent(new Event(MODE_CHANGE_EVENT))
  } catch {
    // 保存できない環境では URL だけで判断する
  }
}

export const subscribeContentMode = (listener: () => void) => {
  window.addEventListener(MODE_CHANGE_EVENT, listener)
  // ほかのタブで切り替えたとき
  window.addEventListener("storage", listener)
  return () => {
    window.removeEventListener(MODE_CHANGE_EVENT, listener)
    window.removeEventListener("storage", listener)
  }
}

const splitLocale = (pathname: string) => {
  const match = pathname.match(/^\/en(?=\/|$)/)
  const localePrefix = match ? "/en" : ""
  return {
    localePrefix,
    path: pathname.slice(localePrefix.length) || "/",
  }
}

export const isR18Path = (pathname: string) => {
  return /^\/r(?:\/|$)/.test(splitLocale(pathname).path)
}

/**
 * /r のページがあるパス（app/routes の ($lang).r.* と同じ）
 * 作品ページは載せない: 作品の年齢区分に合わせてサーバーが /posts と /r/posts を振り分けるので、
 * ここで置き換えると行ったり来たりになる
 */
const R18_TWIN_PATHS: RegExp[] = [
  /^\/posts\/(?:2d|3d|2\.5d)\/?$/,
  /^\/(?:ai-)?rankings(?:\/|$)/,
  /^\/albums\/?$/,
  /^\/search(?:\/|$)/,
  /^\/stickers\/?$/,
  /^\/collections(?:\/|$)/,
  /^\/comments\/new\/?$/,
  /^\/events(?:\/[^/]+(?:\/award)?)?\/?$/,
  /^\/followers\/?$/,
  /^\/following\/?$/,
  /^\/models\/[^/]+\/?$/,
  /^\/series\/?$/,
  /^\/tags(?:\/[^/]+)?\/?$/,
  /^\/themes(?:\/|$)/,
  /^\/users\/[^/]+(?:\/(?:albums|badges|collections|notes|novels|posts|stickers|videos))?\/?$/,
]

/** トップ系のページは /r のタブになる */
const R18_HOME_TABS: Record<string, string> = {
  "/": "new",
  "/home": "home",
  "/follow-user-works": "follow-user",
  "/follow-tag-works": "follow-tag",
}

/**
 * 全年齢のパスに対応する R18 のパス。/r のページがなければ null（生成・設定・作品ページなど）
 */
export const toR18Path = (pathname: string, search = ""): string | null => {
  const { localePrefix, path } = splitLocale(pathname)

  if (isR18Path(pathname)) return null

  const tab = R18_HOME_TABS[path]
  if (tab !== undefined) {
    const params = new URLSearchParams(search)
    params.set("tab", tab)
    return `${localePrefix}/r?${params.toString()}`
  }

  if (R18_TWIN_PATHS.some((pattern) => pattern.test(path))) {
    return `${localePrefix}/r${path}${search}`
  }

  return null
}
