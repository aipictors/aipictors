import { useCallback, useEffect, useRef, useState } from "react"

/** 全部が表示済みの作品だったときに、続けて読むページ数の上限 */
const MAX_DUPLICATE_PAGES = 3

/**
 * 次のページを読み足す。件数が 1 ページに満たなければ最後のページ。
 * 読む位置は表示した数ではなくサーバーから受け取った数で進める（重複を除くと位置がずれて同じページを読み直す）
 */
export async function readNextFeedPage<T>(props: {
  offset: number
  perPage: number
  fetchPage: (offset: number) => Promise<T[]>
  appendPage: (posts: T[]) => number
}): Promise<{ nextOffset: number; isEnded: boolean }> {
  let offset = props.offset
  for (let index = 0; index < MAX_DUPLICATE_PAGES; index++) {
    const posts = await props.fetchPage(offset)
    offset += posts.length
    const added = props.appendPage(posts)
    if (posts.length < props.perPage) {
      return { nextOffset: offset, isEnded: true }
    }
    if (added > 0) {
      return { nextOffset: offset, isEnded: false }
    }
  }
  return { nextOffset: offset, isEnded: true }
}

/**
 * フィードの続きを読む（最後のページで止める・失敗したら止めて読み直せるようにする）
 */
export function useFeedLoadMore<T>(props: {
  perPage: number
  flatLength: number
  isReady: boolean
  /** 変わったら読み直す（表示の種類・年齢制限など） */
  resetKey: string
  fetchPage: (offset: number) => Promise<T[]>
  appendPage: (posts: T[]) => number
}) {
  const { perPage, flatLength, isReady, resetKey, fetchPage, appendPage } =
    props
  const [isEnded, setIsEnded] = useState(false)
  const [isLoadMoreFailed, setIsLoadMoreFailed] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const isInFlightRef = useRef(false)
  const nextOffsetRef = useRef<number | null>(null)

  useEffect(() => {
    nextOffsetRef.current = null
    setIsEnded(false)
    setIsLoadMoreFailed(false)
  }, [resetKey])

  const retryLoadMore = useCallback(async () => {
    if (isInFlightRef.current) return
    isInFlightRef.current = true
    setIsLoadMoreFailed(false)
    setIsLoadingMore(true)
    try {
      const result = await readNextFeedPage({
        offset: nextOffsetRef.current ?? flatLength,
        perPage,
        fetchPage,
        appendPage,
      })
      nextOffsetRef.current = result.nextOffset
      if (result.isEnded) setIsEnded(true)
    } catch {
      setIsLoadMoreFailed(true)
    } finally {
      isInFlightRef.current = false
      setIsLoadingMore(false)
    }
  }, [flatLength, perPage, fetchPage, appendPage])

  const loadMore = useCallback(async () => {
    if (!isReady || isEnded || isLoadMoreFailed) return
    await retryLoadMore()
  }, [isReady, isEnded, isLoadMoreFailed, retryLoadMore])

  return {
    hasNext: flatLength > 0 && !isEnded && !isLoadMoreFailed,
    isLoadingMore,
    isLoadMoreFailed,
    loadMore,
    retryLoadMore,
  }
}
