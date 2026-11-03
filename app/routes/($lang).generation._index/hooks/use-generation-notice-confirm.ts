import { useEffect, useRef, useState } from "react"
import { useLocalStorage } from "usehooks-ts"
import { useGenerationNotice } from "~/routes/($lang).generation._index/components/submission-view/generation-notice"
import { GENERATION_NOTICE_ACK_STORAGE_KEY } from "~/utils/generation-notice"

/**
 * 生成を送る前のお知らせの確認
 */
export function useGenerationNoticeConfirm() {
  // メンテナンス中・不安定などのお知らせ（運営が KV に置く）
  const generationNotice = useGenerationNotice()

  const [generationNoticeAckId, setGenerationNoticeAckId] = useLocalStorage<
    string | null
  >(GENERATION_NOTICE_ACK_STORAGE_KEY, null)

  const [generationNoticeDialogMode, setGenerationNoticeDialogMode] = useState<
    "confirm" | "info" | null
  >(null)
  const generationNoticeResolveRef = useRef<
    ((isConfirmed: boolean) => void) | null
  >(null)

  const settleGenerationNotice = (isConfirmed: boolean) => {
    generationNoticeResolveRef.current?.(isConfirmed)
    generationNoticeResolveRef.current = null
    setGenerationNoticeDialogMode(null)
  }

  // 確認中にお知らせが取り下げられたら、そのまま送る
  useEffect(() => {
    if (generationNotice === null && generationNoticeDialogMode !== null) {
      generationNoticeResolveRef.current?.(true)
      generationNoticeResolveRef.current = null
      setGenerationNoticeDialogMode(null)
    }
  }, [generationNotice, generationNoticeDialogMode])

  /**
   * 生成を送る前にお知らせを出す。送ってよければ true
   * - メンテナンス中は送らない
   * - それ以外は、同じお知らせを一度確認したら次からは出さない
   */
  const confirmGenerationNotice = () => {
    const notice = generationNotice
    if (notice === null) return Promise.resolve(true)
    if (notice.kind !== "maintenance" && generationNoticeAckId === notice.id) {
      return Promise.resolve(true)
    }
    return new Promise<boolean>((resolve) => {
      generationNoticeResolveRef.current = (isConfirmed) => {
        if (isConfirmed) setGenerationNoticeAckId(notice.id)
        resolve(isConfirmed && notice.kind !== "maintenance")
      }
      setGenerationNoticeDialogMode("confirm")
    })
  }

  return {
    generationNotice,
    generationNoticeDialogMode,
    setGenerationNoticeDialogMode,
    settleGenerationNotice,
    confirmGenerationNotice,
  }
}
