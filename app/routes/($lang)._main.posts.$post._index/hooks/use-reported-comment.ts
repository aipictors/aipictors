import { useEffect, useState } from "react"

/**
 * 自分が通報したコメント（TikTok のように、通報したらその人の画面ではすぐ畳む）
 * 端末に覚えておくだけ（運営の判断とは別。表示ボタンで見られる）
 */
const STORAGE_KEY = "aipictors:reported-comment-ids"
const EVENT_NAME = "aipictors:reported-comment"
const MAX_IDS = 300

const readIds = (): string[] => {
  if (typeof window === "undefined") return []
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]")
    return Array.isArray(value) ? value.map(String) : []
  } catch {
    return []
  }
}

export const markCommentReported = (commentId: string) => {
  if (typeof window === "undefined") return
  const ids = [commentId, ...readIds().filter((id) => id !== commentId)].slice(
    0,
    MAX_IDS,
  )
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // 保存できなくても今の画面では畳む
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: commentId }))
}

export function useIsReportedComment(commentId: string) {
  const [isReported, setIsReported] = useState(false)

  useEffect(() => {
    setIsReported(readIds().includes(commentId))
    const onReported = (event: Event) => {
      if ((event as CustomEvent<string>).detail === commentId) {
        setIsReported(true)
      }
    }
    window.addEventListener(EVENT_NAME, onReported)
    return () => window.removeEventListener(EVENT_NAME, onReported)
  }, [commentId])

  return isReported
}
