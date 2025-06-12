import { useCallback, useState } from "react"

/**
 * `pages` を sessionStorage に永続化して、
 * 画面遷移後に戻ってきても一覧を即復元できるフック。
 *
 * @param initial 初期ページ配列（キャッシュ復元などで 1 ページ目だけ渡す）
 * @param storageKey フィルタ条件＋anchorAt など一意なキーを渡すと永続化される
 */
export function usePagedInfinite<T>(initial: T[][] = [], storageKey?: string) {
  /* ---------- internal ---------- */
  const STORAGE_ID = storageKey ? `homeWorks-pages:${storageKey}` : undefined

  /* ---------- 初期化 ---------- */
  const [pages, _setPages] = useState<T[][]>(() => {
    if (!STORAGE_ID) return initial
    try {
      const saved = sessionStorage.getItem(STORAGE_ID)
      return saved ? (JSON.parse(saved) as T[][]) : initial
    } catch {
      return initial
    }
  })

  /* ---------- util ---------- */
  const persist = (next: T[][]) => {
    if (!STORAGE_ID) return
    try {
      sessionStorage.setItem(STORAGE_ID, JSON.stringify(next))
    } catch {
      /* quota exceeded 等は無視 */
    }
  }

  const setPages = (updater: (prev: T[][]) => T[][]) => {
    _setPages((prev) => {
      const next = updater(prev)
      persist(next)
      return next
    })
  }

  const flat = pages.flat()

  /* ---------- API ---------- */
  const appendPage = useCallback((newPage: T[]) => {
    if (newPage.length === 0) return
    setPages((prev) => [...prev, newPage])
  }, [])

  const appendPages = useCallback((newPages: T[][]) => {
    const filtered = newPages.filter((p) => p.length > 0)
    if (filtered.length === 0) return
    setPages((prev) => [...prev, ...filtered])
  }, [])

  const replaceFirstPage = useCallback((page1: T[]) => {
    setPages((prev) => [page1, ...prev.slice(1)])
  }, [])

  /** 一括置換（キャッシュ復元など） */
  const setPagesDirect = useCallback((all: T[][]) => {
    _setPages(all)
    persist(all)
  }, [])

  /** 永続化を手動でクリアしたい場合に呼ぶ */
  const clearPersisted = useCallback(() => {
    if (STORAGE_ID) sessionStorage.removeItem(STORAGE_ID)
  }, [])

  return {
    pages,
    flat,
    appendPage,
    appendPages,
    replaceFirstPage,
    setPages: setPagesDirect,
    clearPersisted,
  }
}
