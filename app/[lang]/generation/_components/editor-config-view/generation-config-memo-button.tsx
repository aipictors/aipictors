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
    <div className="flex w-full flex-col gap-y-2">
      <Button onClick={props.onClick} variant={"secondary"}>
        <StickyNote className="w-4" />
        マイプリセット
      </Button>
    </div>
  )
}
