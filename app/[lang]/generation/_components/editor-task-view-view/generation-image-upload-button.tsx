import { Button } from "@/components/ui/button"
import { FileUp } from "lucide-react"

type Props = {
  disabled: boolean
  selectedTaskIds: string[]
}

/**
 * 生成画像の投稿ボタン
 * @param props
 * @returns
 */
export function GenerationImagePostButton(props: Props) {
  const onClick = async () => {
    console.log(props.selectedTaskIds.join("%7C"))
    const url = `https://www.aipictors.com/post?generation=${props.selectedTaskIds.join(
      "%7C",
    )}`
    window.open(url, "_blank")
  }

  return (
    <Button
      disabled={props.disabled}
      variant="ghost"
      size="icon"
      onClick={onClick}
    >
      <FileUp className="w-4" />
    </Button>
  )
}
