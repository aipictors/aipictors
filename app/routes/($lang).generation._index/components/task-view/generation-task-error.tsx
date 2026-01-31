import { Button } from "~/components/ui/button"
import { FrownIcon } from "lucide-react"
import { useCallback } from "react"

/**
 * エラーになった履歴
 */
export function GenerationTaskError () {
  const reloadPage = useCallback(() => {
    window.location.reload()
  }, [])

  return (
    <div className="flex flex-col gap-y-2 p-4">
      <FrownIcon className="size-6" />
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
