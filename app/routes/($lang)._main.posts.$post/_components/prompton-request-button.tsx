import { Button } from "@/_components/ui/button"
import { GiftIcon } from "lucide-react"

type Props = {
  promptonId: string
}

/**
 * 投稿者への支援ボタン
 */
export const PromptonRequestButton = (props: Props) => {
  const onClick = () => {
    window.open(`https://prompton.io/aipic/${props.promptonId}`, "_blank")
  }

  return (
    <Button onClick={onClick} size={"icon"} variant={"secondary"} {...props}>
      <GiftIcon className="w-4" />
    </Button>
  )
}
