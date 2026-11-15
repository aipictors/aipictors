/**
 * 最近の検索（この端末の localStorage に保存。アプリの「最近の検索」と同じく新しい順に 20 件）
 */
const STORAGE_KEY = "aip.recentSearches"
const MAX_COUNT = 20

const normalize = (text: string) =>
  text
    .trim()
    .replace(/^[#＃]+/, "")
    .trim()

/** 言葉を先頭に足す（同じ言葉は前のものを消す） */
export const addRecentSearch = (list: string[], text: string): string[] => {
  const value = normalize(text)
  if (value === "") return list
  return [value, ...list.filter((item) => item !== value)].slice(0, MAX_COUNT)
}

export const parseRecentSearches = (raw: string | null): string[] => {
  try {
    const value: unknown = JSON.parse(raw ?? "[]")
    return Array.isArray(value)
      ? value
          .filter((item): item is string => typeof item === "string")
          .slice(0, MAX_COUNT)
      : []
  } catch {
    return []
  }
}

export const loadRecentSearches = (): string[] => {
  try {
    return parseRecentSearches(localStorage.getItem(STORAGE_KEY))
  } catch {
    return []
  }
}

export const saveRecentSearches = (list: string[]) => {
  try {
    if (list.length === 0) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // 保存できない（プライベートブラウズなど）ときは覚えないだけ
  }
}

export const rememberRecentSearch = (text: string) => {
  saveRecentSearches(addRecentSearch(loadRecentSearches(), text))
}
