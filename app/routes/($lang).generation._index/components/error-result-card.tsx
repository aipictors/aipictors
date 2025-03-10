import { Card } from "~/components/ui/card"
import { FrownIcon } from "lucide-react"

/**
 * エラーになった履歴
 */
export function ErrorResultCard() {
  return (
    <Card>
      <div className="flex flex-col gap-y-2 p-4">
        <FrownIcon className="size-6" />
        <span className="text-sm">{"エラーが発生しました"}</span>
      </div>
    </Card>
  )
}
