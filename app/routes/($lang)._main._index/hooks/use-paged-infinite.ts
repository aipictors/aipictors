import { useCallback, useState } from "react"

/**
 * 取得結果を「ページの配列」として保持。
 * UI では pages.map(...) でページ単位に包むことで、
 * 既存ノードを触らず末尾にだけ DOM を追加できる。
 */
export function usePagedInfinite<T>(initial: T[][] = []) {
  const [pages, setPages] = useState<T[][]>(initial) // ← 初期値受け取り

  const flat = pages.flat()

  /** 1 ページ追加 */
  const appendPage = useCallback((newPage: T[]) => {
    if (newPage.length === 0) return
    setPages((prev) => [...prev, newPage])
  }, [])

  /** 複数ページ一括追加 */
  const appendPages = useCallback((newPages: T[][]) => {
    if (newPages.length === 0) return
    // 空配列や空ページを除外したい場合は下行を使う
    // const filtered = newPages.filter((p) => p.length > 0)
    setPages((prev) => [...prev, ...newPages])
  }, [])

  /** 1 ページ目を差し替え */
  const replaceFirstPage = useCallback((page1: T[]) => {
    setPages([page1])
  }, [])

  /** キャッシュ復元などでまとめて置き換え */
  const setPagesDirect = useCallback((all: T[][]) => {
    setPages(all)
  }, [])

  return {
    pages,
    flat,
    appendPage,
    appendPages,
    replaceFirstPage,
    setPages: setPagesDirect,
  }
}
