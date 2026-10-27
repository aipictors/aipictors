import { useEffect, useRef, useState } from "react"

export type GenerationProgress = {
  state: "waiting" | "queued" | "active" | "completed"
  /** 0〜1 */
  progress: number
  /** 残り秒数の目安 */
  eta: number | null
  /** 途中経過の画像（data URL） */
  preview: string | null
  queuePosition: number | null
}

const POLL_INTERVAL_MS = 1200

/**
 * 生成中のタスクの途中経過を取得する（/api/generation/progress を短い間隔で確認）
 * GPU での生成が終わったら "generation:task-completed" イベントを出し、一覧をすぐ更新させる
 */
export function useGenerationProgress(
  taskNanoid: string | null | undefined,
  isEnabled: boolean,
) {
  const [progress, setProgress] = useState<GenerationProgress | null>(null)
  const previewIdRef = useRef(-1)
  const previewRef = useRef<string | null>(null)
  const hasNotifiedRef = useRef(false)
  const wasActiveRef = useRef(false)

  useEffect(() => {
    if (!taskNanoid || !isEnabled || typeof window === "undefined") {
      return
    }
    let isCancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const notifyCompleted = () => {
      if (hasNotifiedRef.current) return
      hasNotifiedRef.current = true
      window.dispatchEvent(
        new CustomEvent("generation:task-completed", {
          detail: { nanoid: taskNanoid },
        }),
      )
    }

    const poll = async () => {
      if (isCancelled) return
      if (document.visibilityState === "visible") {
        try {
          const response = await fetch(
            `/api/generation/progress?id=${encodeURIComponent(taskNanoid)}&preview=${previewIdRef.current}`,
          )
          const json = (await response.json()) as {
            data: (GenerationProgress & { previewId: number }) | null
          }
          if (!isCancelled && json.data) {
            const data = json.data
            if (data.preview) {
              previewRef.current = data.preview
              previewIdRef.current = data.previewId
            }
            if (data.state === "active") {
              wasActiveRef.current = true
            }
            // 生成が終わった（または GPU から消えた）ら一覧の更新を促す
            if (
              data.state === "completed" ||
              (wasActiveRef.current && data.state === "waiting")
            ) {
              notifyCompleted()
            }
            setProgress({
              state:
                wasActiveRef.current && data.state === "waiting"
                  ? "completed"
                  : data.state,
              progress: data.progress,
              eta: data.eta,
              preview: previewRef.current,
              queuePosition: data.queuePosition,
            })
          }
        } catch {
          // 取得できないときは次の回に任せる
        }
      }
      if (!isCancelled) {
        timer = setTimeout(poll, POLL_INTERVAL_MS)
      }
    }

    poll()

    return () => {
      isCancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [taskNanoid, isEnabled])

  return progress
}
