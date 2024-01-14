import { Card } from "@/components/ui/card"
import { FrownIcon } from "lucide-react"

/**
 * エラーになった履歴
 * @returns
 */
export const ErrorHistoryCard = () => {
  return (
    <Card>
      <div className="p-4 flex flex-col gap-y-2">
        <FrownIcon className="h-6 w-6" />
        <span className="text-sm">{"エラーが発生しました"}</span>
      </div>
    </Card>
  )
}
