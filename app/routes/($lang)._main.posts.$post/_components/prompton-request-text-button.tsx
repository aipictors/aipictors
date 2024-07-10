import { Button } from "@/_components/ui/button"
import { GiftIcon } from "lucide-react"

type Props = {
  promptonId: string
}

/**
 * 投稿者への支援ボタン
 */
export const PromptonRequestTextButton = (props: Props) => {
  const onClick = () => {
    window.open(`https://prompton.io/aipic/${props.promptonId}`, "_blank")
  }

  return (
    <Button onClick={onClick} size={"sm"} variant={"secondary"} {...props}>
      <div className="flex items-center space-x-2">
        <p>{"サポート"}</p>
        <GiftIcon className="w-4" />
      </div>
    </Button>
  )
}
