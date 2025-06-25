// hooks/use-paged-infinite.ts
import { useCallback, useState, useMemo } from "react"

type ObjectWithId = {
  id: string | number
  [key: string]: string | number | boolean | null | undefined | object
}

interface UsePagedInfiniteOptions<T extends ObjectWithId> {
  idKey?: keyof T
  debug?: boolean
}

export function usePagedInfinite<T extends ObjectWithId>(
  initial: T[][] = [],
  storageKey?: string,
  options: UsePagedInfiniteOptions<T> = {},
) {
  const { idKey = "id" as keyof T, debug = false } = options
  const STORAGE_ID = storageKey ? `homeWorks-pages:${storageKey}` : undefined

  const [pages, _setPages] = useState<T[][]>(() => {
    if (!STORAGE_ID) return initial
    try {
      const saved = sessionStorage.getItem(STORAGE_ID)
      if (!saved) return initial

      const parsed = JSON.parse(saved)
      if (
        Array.isArray(parsed) &&
        parsed.every((page) => Array.isArray(page))
      ) {
        const restored = parsed as T[][]
        if (debug) {
          console.log(
            "[usePagedInfinite] Restored from storage:",
            restored.length,
            "pages",
          )
        }
        return restored
      }
      return initial
    } catch (error) {
      if (debug) {
        console.warn(
          "[usePagedInfinite] Failed to restore from storage:",
          error,
        )
      }
      return initial
    }
  })

  const existingIds = useMemo(() => {
    const ids = new Set<T[keyof T]>()
    for (const page of pages) {
      for (const item of page) {
        const id = item[idKey]
        if (id != null) {
          ids.add(id)
        }
      }
    }
    return ids
  }, [pages, idKey])

  const persist = useCallback(
    (next: T[][]) => {
      if (!STORAGE_ID) return
      try {
        sessionStorage.setItem(STORAGE_ID, JSON.stringify(next))
        if (debug) {
          console.log("[usePagedInfinite] Persisted:", next.length, "pages")
        }
      } catch (error) {
        if (debug) {
          console.warn("[usePagedInfinite] Failed to persist:", error)
        }
      }
    },
    [STORAGE_ID, debug],
  )

  const setPages = useCallback(
    (updater: (prev: T[][]) => T[][]) => {
      _setPages((prev) => {
        const next = updater(prev)
        persist(next)
        return next
      })
    },
    [persist],
  )

  const deduplicateItems = useCallback(
    (items: T[], currentIds?: Set<T[keyof T]>): T[] => {
      const idsToCheck = currentIds ?? existingIds
      const deduplicated = items.filter((item) => {
        const id = item[idKey]
        return id == null || !idsToCheck.has(id)
      })

      if (debug && deduplicated.length !== items.length) {
        console.log(
          `[usePagedInfinite] Removed ${items.length - deduplicated.length} duplicates`,
        )
      }

      return deduplicated
    },
    [existingIds, idKey, debug],
  )

  const flat = useMemo(() => pages.flat(), [pages])

  const appendPage = useCallback(
    (newPage: T[]) => {
      if (newPage.length === 0) return

      const deduplicated = deduplicateItems(newPage)
      if (deduplicated.length === 0) {
        if (debug) {
          console.log(
            "[usePagedInfinite] All items were duplicates, skipping append",
          )
        }
        return
      }

      setPages((prev) => [...prev, deduplicated])
    },
    [deduplicateItems, debug, setPages],
  )

  const appendPages = useCallback(
    (newPages: T[][]) => {
      if (newPages.length === 0) return

      const currentIds = new Set(existingIds)
      const deduplicatedPages: T[][] = []

      for (const page of newPages) {
        const deduplicated = deduplicateItems(page, currentIds)
        if (deduplicated.length > 0) {
          for (const item of deduplicated) {
            const id = item[idKey]
            if (id != null) {
              currentIds.add(id)
            }
          }
          deduplicatedPages.push(deduplicated)
        }
      }

      if (deduplicatedPages.length === 0) {
        if (debug) {
          console.log(
            "[usePagedInfinite] All pages were duplicates, skipping append",
          )
        }
        return
      }

      setPages((prev) => [...prev, ...deduplicatedPages])
    },
    [existingIds, deduplicateItems, idKey, debug, setPages],
  )

  // 初回やタブ切り替え時に実行される関数を強化
  const replaceFirstPage = useCallback(
    (page1: T[]) => {
      // ページが空の場合、ただ置き換える（タブ切り替え時など）
      if (pages.length === 0) {
        setPages(() => [page1])
        return
      }

      // 他のページのIDを収集
      const otherPagesIds = new Set<T[keyof T]>()
      for (let i = 1; i < pages.length; i++) {
        for (const item of pages[i]) {
          const id = item[idKey]
          if (id != null) {
            otherPagesIds.add(id)
          }
        }
      }

      // 重複を除外
      const deduplicated = page1.filter((item) => {
        const id = item[idKey]
        return id == null || !otherPagesIds.has(id)
      })

      if (debug && deduplicated.length !== page1.length) {
        console.log(
          `[usePagedInfinite] Removed ${page1.length - deduplicated.length} duplicates from first page`,
        )
      }

      // 最初のページを置き換え
      setPages((prev) => {
        // タブ切り替え時など、完全に新しいデータの場合は全体を置き換える
        const isDifferentDataSet =
          prev.length > 0 &&
          prev[0].length > 0 &&
          deduplicated.length > 0 &&
          prev[0][0][idKey] !== deduplicated[0][idKey]

        if (isDifferentDataSet) {
          if (debug) {
            console.log(
              "[usePagedInfinite] Detected tab change, replacing all pages",
            )
          }
          return [deduplicated]
        }

        // 通常の更新
        return [deduplicated, ...prev.slice(1)]
      })
    },
    [pages, idKey, debug, setPages],
  )

  const setPagesDirect = useCallback(
    (all: T[][]) => {
      _setPages(all)
      persist(all)
    },
    [persist],
  )

  const clearAll = useCallback(() => {
    _setPages([])
    if (STORAGE_ID) {
      sessionStorage.removeItem(STORAGE_ID)
    }
  }, [STORAGE_ID])

  const clearPersisted = useCallback(() => {
    if (STORAGE_ID) {
      sessionStorage.removeItem(STORAGE_ID)
      if (debug) {
        console.log("[usePagedInfinite] Cleared persisted data")
      }
    }
  }, [STORAGE_ID, debug])

  const stats = useMemo(
    () => ({
      pageCount: pages.length,
      totalItems: flat.length,
      averageItemsPerPage: pages.length > 0 ? flat.length / pages.length : 0,
      uniqueIds: existingIds.size,
    }),
    [pages.length, flat.length, existingIds.size],
  )

  return {
    pages,
    flat,
    appendPage,
    appendPages,
    replaceFirstPage,
    setPages: setPagesDirect,
    clearAll,
    clearPersisted,
    stats,
    ...(debug ? { existingIds } : {}),
  } as const
}
