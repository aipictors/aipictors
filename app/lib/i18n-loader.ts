import type { Locale } from "~/contexts/locale-context"

// シンプルな辞書キャッシュ（メモリ）
const dictionaryCache: Record<string, Record<string, string> | undefined> = {}

export type LoadDictionaryResult = {
  namespace: string
  entries: Record<string, string>
}

async function fetchJson(path: string): Promise<Record<string, string>> {
  const res = await fetch(path)
  if (!res.ok) {
    throw new Error(`Failed to load dictionary: ${path} ${res.status}`)
  }
  return (await res.json()) as Record<string, string>
}

// 名前空間付き辞書をロードする
export async function loadDictionary(
  locale: Locale,
  namespace: string,
): Promise<LoadDictionaryResult> {
  const cacheKey = `${locale}:${namespace}`
  const cached = dictionaryCache[cacheKey]
  if (cached) {
    return { namespace, entries: cached }
  }
  // public/locales/{locale}/{namespace}.json を想定
  const path = `/locales/${locale}/${namespace}.json`
  try {
    const data = await fetchJson(path)
    dictionaryCache[cacheKey] = data
    return { namespace, entries: data }
  } catch {
    // 失敗時は空辞書でキャッシュ（大量リクエスト防止）
    dictionaryCache[cacheKey] = {}
    return { namespace, entries: {} }
  }
}

// 事前プリロード（複数名前空間）
export async function preloadDictionaries(
  locale: Locale,
  namespaces: string[],
): Promise<Record<string, Record<string, string>>> {
  const result: Record<string, Record<string, string>> = {}
  for (const ns of namespaces) {
    const loaded = await loadDictionary(locale, ns)
    result[loaded.namespace] = loaded.entries
  }
  return result
}

export function seedI18nCache(
  locale: Locale,
  dicts: Record<string, Record<string, string>>,
) {
  for (const namespace of Object.keys(dicts)) {
    dictionaryCache[`${locale}:${namespace}`] = dicts[namespace]
  }
}

// ブラウザ初期化時に window.__i18n があればシード
if (typeof window !== "undefined") {
  type I18nWindowData = {
    locale: Locale
    dictionaries: Record<string, Record<string, string>>
  }
  const w = window as unknown as { __i18n?: I18nWindowData }
  if (w.__i18n) {
    seedI18nCache(w.__i18n.locale, w.__i18n.dictionaries)
  }
}
