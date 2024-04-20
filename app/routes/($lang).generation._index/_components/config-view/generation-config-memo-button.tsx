import { Button } from "@/_components/ui/button"
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
    <div
      title="生成情報にメモをつけて保存、復元することができます。"
      className="flex w-16 flex-col gap-y-2"
    >
      <Button onClick={props.onClick} variant={"secondary"}>
        <StickyNote className="w-4" />
      </Button>
    </div>
  )
}
