import { Card } from "@/_components/ui/card"
import { Loader2Icon } from "lucide-react"

/**
 * 読み込み中の履歴
 */
export const FallbackTaskCard = () => {
  return (
    <Card>
      <div className="flex flex-col p-4">
        <Loader2Icon className="h-6 w-6 animate-spin" />
      </div>
    </Card>
  )
}
