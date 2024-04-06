import { Button } from "@/_components/ui/button"
import { Card } from "@/_components/ui/card"
import { FrownIcon } from "lucide-react"
import { useCallback } from "react"

/**
 * エラーになった履歴
 * @returns
 */
export const generationTaskError = () => {
  const reloadPage = useCallback(() => {
    window.location.reload()
  }, [])

  return (
    <div className="flex flex-col gap-y-2 p-4">
      <FrownIcon className="h-6 w-6" />
      <span className="text-sm">
        {"エラーが発生しました、画面を更新ください。"}
      </span>
      <Button onClick={reloadPage} className="mt-4">
        更新
      </Button>{" "}
      {/* 更新ボタンを追加 */}
    </div>
  )
}
