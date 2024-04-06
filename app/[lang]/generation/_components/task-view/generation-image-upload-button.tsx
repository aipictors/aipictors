import { Button } from "@/components/ui/button"
import { FileUp } from "lucide-react"
import { toast } from "sonner"

type Props = {
  disabled: boolean
  selectedTaskIds: string[]
  title?: string
  isEnable?: boolean
}

/**
 * 生成画像の投稿ボタン
 * @param props
 * @returns
 */
export function GenerationImagePostButton(props: Props) {
  const onClick = async () => {
    const url = `https://www.aipictors.com/post?generation=${props.selectedTaskIds.join(
      "%7C",
    )}`
    window.open(url, "_blank")
  }

  return props.isEnable ? (
    <Button
      onClick={() => {
        toast("対象の履歴を選択してください。")
      }}
      title={props.title}
      disabled={props.disabled}
      variant={"ghost"}
      size={"icon"}
    >
      <FileUp className="w-4" />
    </Button>
  ) : (
    <Button
      title={props.title}
      disabled={props.disabled}
      variant="ghost"
      size="icon"
      onClick={onClick}
    >
      <FileUp className="w-4" />
    </Button>
  )
}
