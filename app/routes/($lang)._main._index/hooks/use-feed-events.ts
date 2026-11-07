import { gql, useApolloClient } from "@apollo/client/index"
import { useCallback, useContext, useEffect, useRef } from "react"
import { AuthContext } from "~/contexts/auth-context"

export type FeedEventType = "IMPRESSION" | "CLICK" | "HIDE"

const recordFeedEventsMutation = gql`
  mutation RecordFeedEvents($events: [FeedEventInput!]!) {
    recordFeedEvents(events: $events)
  }
`

/**
 * おすすめ一覧での反応（画面に出た・開いた・興味なし）をまとめて送る
 * おすすめの並べ替えと学習に使う。ログインしていなければ送らない
 */
export function useFeedEvents() {
  const client = useApolloClient()
  const authContext = useContext(AuthContext)
  const queue = useRef<{ workId: string; type: FeedEventType }[]>([])
  const sentImpressions = useRef(new Set<string>())

  const flush = useCallback(() => {
    if (!authContext.isLoggedIn || queue.current.length === 0) return
    const events = queue.current.splice(0, 200)
    client
      .mutate({ mutation: recordFeedEventsMutation, variables: { events } })
      .catch(() => {})
  }, [client, authContext.isLoggedIn])

  useEffect(() => {
    const timer = setInterval(flush, 5000)
    const onHide = () => {
      if (document.visibilityState === "hidden") flush()
    }
    document.addEventListener("visibilitychange", onHide)
    return () => {
      clearInterval(timer)
      document.removeEventListener("visibilitychange", onHide)
      flush()
    }
  }, [flush])

  const record = useCallback(
    (workId: string, type: FeedEventType) => {
      if (!authContext.isLoggedIn) return
      if (type === "IMPRESSION") {
        // 同じ画面で何度も数えない
        if (sentImpressions.current.has(workId)) return
        sentImpressions.current.add(workId)
      }
      queue.current.push({ workId, type })
      // 開いた・興味なしはすぐ送る（ページを移ると送れないことがあるため）
      if (type !== "IMPRESSION") flush()
    },
    [authContext.isLoggedIn, flush],
  )

  /**
   * 一覧の中の作品（data-work-id）が半分以上・1 秒以上見えたら「画面に出た」とする
   */
  const observe = useCallback(
    (container: HTMLElement | null) => {
      if (container === null || !("IntersectionObserver" in window)) return
      const timers = new Map<Element, ReturnType<typeof setTimeout>>()
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const workId = (entry.target as HTMLElement).dataset.workId
            if (!workId) continue
            if (entry.isIntersecting) {
              timers.set(
                entry.target,
                setTimeout(() => record(workId, "IMPRESSION"), 1000),
              )
            } else {
              clearTimeout(timers.get(entry.target))
              timers.delete(entry.target)
            }
          }
        },
        { threshold: 0.5 },
      )
      const watch = () => {
        for (const el of container.querySelectorAll("[data-work-id]")) {
          observer.observe(el)
        }
      }
      watch()
      // 続きを読み込んで増えた作品も見る
      const mutation = new MutationObserver(watch)
      mutation.observe(container, { childList: true, subtree: true })
      return () => {
        observer.disconnect()
        mutation.disconnect()
        for (const timer of timers.values()) clearTimeout(timer)
      }
    },
    [record],
  )

  return { record, observe }
}
