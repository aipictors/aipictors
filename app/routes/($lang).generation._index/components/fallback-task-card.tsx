import { Loader2Icon } from "lucide-react"
import { Card } from "~/components/ui/card"

/**
 * 読み込み中の履歴
 */
export function FallbackTaskCard() {
  return (
    <Card className="h-full overflow-hidden">
      <div className="flex flex-col p-4">
        <Loader2Icon className="size-6 animate-spin" />
      </div>
    </Card>
  )
}
