import { useLocale } from "~/hooks/use-locale"
import { useEffect, useRef, useState } from "react"
import { loadDictionary } from "~/lib/i18n-loader"

// 簡易翻訳 Hook
// 既存: t(ja, en) 呼び出しに対応
// 将来: t.key("common.home") のようにキー指定へ移行予定
// Fallback: 英語辞書にキーが無い場合は日本語辞書を参照
export function useTranslation(namespace: string = "common") {
  const locale = useLocale()
  const [dict, setDict] = useState<Record<string, string>>({})
  const [fallbackDict, setFallbackDict] = useState<Record<string, string>>({})
  const loadingRef = useRef(false)
  const nsRef = useRef(namespace)

  useEffect(() => {
    if (nsRef.current !== namespace) {
      nsRef.current = namespace
      setDict({})
      setFallbackDict({})
    }
    let active = true
    const load = async () => {
      if (loadingRef.current) return
      loadingRef.current = true
      const loaded = await loadDictionary(locale as "ja" | "en", namespace)
      if (active) setDict(loaded.entries)
      // 英語利用時のみ日本語辞書をフォールバックとして読み込む
      if (locale === "en") {
        const fallbackLoaded = await loadDictionary("ja", namespace)
        if (active) setFallbackDict(fallbackLoaded.entries)
      } else {
        if (active) setFallbackDict({})
      }
      loadingRef.current = false
    }
    load()
    return () => {
      active = false
    }
  }, [locale, namespace])

  // 後方互換: 2引数 (ja, en)
  const t = (jaText: string, enText: string) => {
    if (locale === "en") return enText
    return jaText
  }

  // key lookup: t.key("some.key", fallback?)

  ;(t as any).key = (key: string, fallback?: string) => {
    const value = dict[key]
    if (value !== undefined && value !== "") return value
    // 英語利用時: en に存在しない場合、日本語辞書を参照
    if (locale === "en") {
      const jaValue = fallbackDict[key]
      if (jaValue !== undefined && jaValue !== "") return jaValue
    }
    if (fallback !== undefined) return fallback
    return key
  }

  ;(t as any).raw = () => dict

  return t as typeof t & {
    key: (key: string, fallback?: string) => string
    raw: () => Record<string, string>
  }
}
