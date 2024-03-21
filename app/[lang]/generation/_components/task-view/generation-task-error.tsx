import { Card } from "@/components/ui/card"
import { FrownIcon } from "lucide-react"

/**
 * エラーになった履歴
 * @returns
 */
export const generationTaskError = () => {
  return (
    <div className="flex flex-col gap-y-2 p-4">
      <FrownIcon className="h-6 w-6" />
      <span className="text-sm">
        {"エラーが発生しました、画面を更新ください。"}
      </span>
    </div>
  )
}
