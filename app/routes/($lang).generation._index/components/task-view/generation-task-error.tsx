import { Button } from "~/components/ui/button"
import { FrownIcon } from "lucide-react"
import { useCallback } from "react"
import { useRevalidator } from "@remix-run/react"

/**
 * エラーになった履歴
 */
export function GenerationTaskError() {
  const revalidator = useRevalidator()

  const reloadPage = useCallback(() => {
    revalidator.revalidate()
  }, [])

  return (
    <div className="flex flex-col gap-y-2 p-4">
      <FrownIcon className="h-6 w-6" />
      <span className="text-sm">
        {"エラーが発生しました、画面を更新ください。"}
      </span>
      <Button onClick={reloadPage} className="mt-4">
        更新
      </Button>
    </div>
  )
}
