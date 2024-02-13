import { Card } from "@/components/ui/card"
import { Loader2Icon } from "lucide-react"

type Props = {
  className?: string
}

/**
 * 読み込み中の履歴
 * @returns
 */
export const InProgressGenerationCard = (props: Props) => {
  return (
    <Card className={props.className}>
      <div className="p-4 flex flex-col gap-y-2">
        <Loader2Icon className="h-6 w-6 animate-spin" />
        <span className="text-sm">{"生成中"}</span>
      </div>
    </Card>
  )
}
