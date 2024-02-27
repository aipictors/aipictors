import { Button } from "@/components/ui/button"
import { StickyNote } from "lucide-react"

type Props = {
  onClick(): void
}

/**
 * 履歴のメモボタン
 * @param props
 * @returns
 */
export function GenerationConfigMemoButton(props: Props) {
  return (
    <div className="flex flex-col gap-y-2 w-full">
      <Button onClick={props.onClick} variant={"secondary"}>
        <StickyNote className="w-4" />
        メモ
      </Button>
    </div>
  )
}
