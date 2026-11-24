// hooks/use-paged-infinite.ts
import { useCallback, useState, useMemo } from "react"

type ObjectWithId = {
  id: string | number
  [key: string]: string | number | boolean | null | undefined | object
}

interface UsePagedInfiniteOptions<T extends ObjectWithId> {
  idKey?: keyof T
  debug?: boolean
  /**
   * 取り直した 1 ページ目が前の 1 ページ目とつながらないときに、
   * 保存しておいた 2 ページ目以降を捨てる（間の作品が抜けて見えなくなるのを防ぐ）
   */
  resetOnFirstPageDisconnect?: boolean
}

/**
 * 取り直した 1 ページ目が、保存しておいた 1 ページ目とつながらなくなったかどうか。
 *
 * 新しい順の一覧は 2 ページ目以降をそのまま覚えているので、開いたままの画面に
 * 1 ページ分より多く新着が増えると、1 ページ目と 2 ページ目の間の作品が抜ける。
 * 同じ作品が 1 つも残っていなければ、つながっていないと判断する。
 */
export function isFirstPageDisconnected<T extends ObjectWithId>(props: {
  pages: T[][]
  nextFirstPage: T[]
  idKey?: keyof T
}): boolean {
  const idKey = props.idKey ?? ("id" as keyof T)
  const previousFirstPage = props.pages[0]
  if (props.pages.length < 2) return false
  if (!previousFirstPage?.length) return false
  if (props.nextFirstPage.length === 0) return false
  return !props.nextFirstPage.some((item) =>
    previousFirstPage.some((previous) => previous[idKey] === item[idKey]),
  )
}

export function usePagedInfinite<T extends ObjectWithId>(
  initial: T[][] = [],
  storageKey?: string,
  options: UsePagedInfiniteOptions<T> = {},
) {
  const {
    idKey = "id" as keyof T,
    debug = false,
    resetOnFirstPageDisconnect = false,
  } = options
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
    (newPage: T[]): number => {
      if (newPage.length === 0) return 0

      const deduplicated = deduplicateItems(newPage)
      if (deduplicated.length === 0) {
        if (debug) {
          console.log(
            "[usePagedInfinite] All items were duplicates, skipping append",
          )
        }
        return 0
      }

      setPages((prev) => [...prev, deduplicated])
      return deduplicated.length
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

  // ✅ 修正: pagesを依存配列から除去して無限ループを防ぐ
  const replaceFirstPage = useCallback(
    (page1: T[]) => {
      setPages((prev) => {
        if (
          resetOnFirstPageDisconnect &&
          isFirstPageDisconnected({ pages: prev, nextFirstPage: page1, idKey })
        ) {
          if (debug) {
            console.log("[usePagedInfinite] Dropped disconnected stale pages")
          }
          return [page1]
        }

        const otherPagesIds = new Set<T[keyof T]>()
        for (let i = 1; i < prev.length; i++) {
          for (const item of prev[i]) {
            const id = item[idKey]
            if (id != null) {
              otherPagesIds.add(id)
            }
          }
        }

        const deduplicated = page1.filter((item) => {
          const id = item[idKey]
          return id == null || !otherPagesIds.has(id)
        })

        if (debug && deduplicated.length !== page1.length) {
          console.log(
            `[usePagedInfinite] Removed ${page1.length - deduplicated.length} duplicates from first page`,
          )
        }

        return [deduplicated, ...prev.slice(1)]
      })
    },
    [idKey, debug, resetOnFirstPageDisconnect, setPages],
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
