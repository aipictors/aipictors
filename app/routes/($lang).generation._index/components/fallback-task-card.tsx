import { Card } from "~/components/ui/card"
import { Loader2Icon } from "lucide-react"

/**
 * 読み込み中の履歴
 */
export function FallbackTaskCard () {
  return (
    <Card>
      <div className="flex flex-col p-4">
        <Loader2Icon className="size-6 animate-spin" />
      </div>
    </Card>
  )
}
