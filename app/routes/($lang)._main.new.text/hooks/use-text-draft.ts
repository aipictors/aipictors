import { useEffect, useRef, useState } from "react"

export type TextDraft = {
  title: string
  caption: string
  md: string
  type: "NOVEL" | "COLUMN"
  savedAt: number
}

const DRAFT_KEY_PREFIX = "aipictors:text-draft:"

const readDraft = (key: string): TextDraft | null => {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) {
      return null
    }
    const draft = JSON.parse(raw) as TextDraft
    if (typeof draft.md !== "string" || typeof draft.title !== "string") {
      return null
    }
    return draft
  } catch {
    return null
  }
}

const hasContent = (draft: Pick<TextDraft, "title" | "caption" | "md">) => {
  return (
    draft.title.trim() !== "" ||
    draft.caption.trim() !== "" ||
    draft.md.trim() !== ""
  )
}

/**
 * 小説・コラムの書きかけを端末に自動で保存する（ユーザーごと）
 * - 開いたときに前回の書きかけがあれば restorable に入る（復元するかは利用者が選ぶ）
 * - 入力が止まって 1 秒で保存する。投稿できたら clear で消す
 */
export function useTextDraft(props: {
  userId: string | null | undefined
  current: Omit<TextDraft, "savedAt">
}) {
  const key = props.userId ? `${DRAFT_KEY_PREFIX}${props.userId}` : null
  const [restorable, setRestorable] = useState<TextDraft | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  /** 復元するか決めるまでは上書きしない */
  const isDecidedRef = useRef(false)

  useEffect(() => {
    if (key === null) {
      return
    }
    const draft = readDraft(key)
    if (draft && hasContent(draft)) {
      setRestorable(draft)
      return
    }
    isDecidedRef.current = true
  }, [key])

  const { title, caption, md, type } = props.current

  useEffect(() => {
    if (key === null || !isDecidedRef.current) {
      return
    }
    if (!hasContent({ title, caption, md })) {
      return
    }
    const timer = setTimeout(() => {
      const now = Date.now()
      try {
        localStorage.setItem(
          key,
          JSON.stringify({ title, caption, md, type, savedAt: now }),
        )
        setSavedAt(now)
      } catch {
        // 容量オーバーなどで保存できなくても書くのは止めない
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [key, title, caption, md, type])

  const decide = () => {
    isDecidedRef.current = true
    setRestorable(null)
  }

  const discard = () => {
    if (key !== null) {
      try {
        localStorage.removeItem(key)
      } catch {
        // 何もしない
      }
    }
    decide()
  }

  const clear = () => {
    discard()
    setSavedAt(null)
  }

  return { restorable, savedAt, decide, discard, clear }
}
