import { useEffect, useRef, useState } from "react"

type PendingRequest = {
  key: string
  count: number
  /** 送信したときに一覧に出ていた生成中の数 */
  baselineInProgressCount: number
  /** サーバーが受け付けた時刻（まだなら null） */
  sentAt: number | null
}

/**
 * 受け付け後、一覧に本物のカードが出るのを待つ最長時間
 */
const MAX_WAIT_AFTER_SENT_MS = 6000

/**
 * 送信がいつまでも終わらないときに仮カードを消すまでの時間
 */
const MAX_SENDING_MS = 30000

/**
 * 生成ボタンを押してから一覧に本物のカードが出るまでの「送信中」の仮カードの数
 * @param inProgressCount 一覧に出ている生成中（画像なし）のカードの数
 */
export function usePendingGenerationRequests(inProgressCount: number) {
  const [requests, setRequests] = useState<PendingRequest[]>([])

  const inProgressCountRef = useRef(inProgressCount)
  inProgressCountRef.current = inProgressCount

  useEffect(() => {
    if (typeof window === "undefined") return

    const onSending = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; count: number }>)
        .detail
      if (!detail || detail.count <= 0) return
      setRequests((prev) => [
        ...prev,
        {
          key: detail.key,
          count: detail.count,
          baselineInProgressCount: inProgressCountRef.current,
          sentAt: null,
        },
      ])
      setTimeout(() => {
        setRequests((prev) => prev.filter((r) => r.key !== detail.key))
      }, MAX_SENDING_MS)
    }

    const onSent = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; count: number }>)
        .detail
      if (!detail) return
      if (detail.count <= 0) {
        // 失敗したときはすぐ消す（エラーは別に表示している）
        setRequests((prev) => prev.filter((r) => r.key !== detail.key))
        return
      }
      setRequests((prev) =>
        prev.map((r) =>
          r.key === detail.key
            ? { ...r, count: detail.count, sentAt: Date.now() }
            : r,
        ),
      )
      setTimeout(() => {
        setRequests((prev) => prev.filter((r) => r.key !== detail.key))
      }, MAX_WAIT_AFTER_SENT_MS)
    }

    window.addEventListener("generation:task-sending", onSending)
    window.addEventListener("generation:task-sent", onSent)
    return () => {
      window.removeEventListener("generation:task-sending", onSending)
      window.removeEventListener("generation:task-sent", onSent)
    }
  }, [])

  // 受け付け済みで、一覧に本物のカードが増えたら仮カードを消す
  useEffect(() => {
    setRequests((prev) => {
      const next = prev.filter((r) => {
        if (r.sentAt === null) return true
        return inProgressCount < r.baselineInProgressCount + r.count
      })
      return next.length === prev.length ? prev : next
    })
  }, [inProgressCount])

  return requests.map((r) => ({
    key: r.key,
    count: r.count,
    isSent: r.sentAt !== null,
  }))
}
