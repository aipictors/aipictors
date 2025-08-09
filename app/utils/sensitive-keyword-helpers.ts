import { isSensitiveKeyword } from "./is-sensitive-keyword"

/**
 * センシティブキーワード警告をスキップするかどうかをチェック
 */
export function shouldSkipSensitiveWarning(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("skipSensitiveKeywordWarning") === "true"
}

/**
 * センシティブキーワード警告の設定をリセット
 */
export function resetSensitiveWarningPreference(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("skipSensitiveKeywordWarning")
}

/**
 * 検索テキストがセンシティブかどうかとその処理方法を判定
 */
export function analyzeSensitiveSearch(searchText: string): {
  isSensitive: boolean
  shouldShowWarning: boolean
  sanitizedText: string
} {
  const sanitizedText = searchText.replace(/#/g, "").trim()
  const isSensitive = isSensitiveKeyword(sanitizedText)
  const shouldShowWarning = isSensitive && !shouldSkipSensitiveWarning()

  return {
    isSensitive,
    shouldShowWarning,
    sanitizedText,
  }
}

/**
 * センシティブキーワードの場合のR18 URLを生成
 */
export function generateSensitiveUrl(
  baseUrl: string,
  isSensitive: boolean,
): string {
  if (!isSensitive) return baseUrl

  // すでに /r 付与済みならそのまま返す
  if (baseUrl.startsWith("/r/") || baseUrl === "/r") return baseUrl

  // R18 URLに変換
  return `/r${baseUrl}`
}
