import { useSearchParams } from "@remix-run/react"
import { useCallback, useEffect } from "react"

type WorkDialogUrlState = {
  isOpen: boolean
  workId: string | null
  openDialog: (workId: string) => void
  closeDialog: () => void
}

/**
 * 作品ダイアログのURL状態管理フック
 * URLパラメータでダイアログの開閉状態と表示中の作品IDを管理
 */
export function useWorkDialogUrl(): WorkDialogUrlState {
  const [searchParams, setSearchParams] = useSearchParams()

  const workId = searchParams.get("work")
  const isOpen = workId !== null

  const openDialog = useCallback(
    (targetWorkId: string) => {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev)
          newParams.set("work", targetWorkId)
          return newParams
        },
        { replace: false }, // 履歴に追加して戻るボタンで閉じられるように
      )
    },
    [setSearchParams],
  )

  const closeDialog = useCallback(() => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev)
        newParams.delete("work")
        return newParams
      },
      { replace: false },
    )
  }, [setSearchParams])

  return {
    isOpen,
    workId,
    openDialog,
    closeDialog,
  }
}
