import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

/**
 * 読み込み中の履歴
 * @returns
 */
export const FallbackHistoryCard = () => {
  return (
    <Card>
      <div className="p-4 flex flex-col">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    </Card>
  )
}
