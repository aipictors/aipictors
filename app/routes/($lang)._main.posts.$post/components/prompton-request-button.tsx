import { Button } from "~/components/ui/button"
import { GiftIcon } from "lucide-react"

type Props = {
  promptonId: string
}

/**
 * 投稿者への支援ボタン
 */
export const PromptonRequestButton = ({ promptonId, ...rest }: Props) => {
  const onClick = () => {
    window.open(`https://prompton.io/aipic/${promptonId}`, "_blank")
  }

  return (
    <Button onClick={onClick} variant={"secondary"} {...rest}>
      <div className="flex items-center space-x-2">
        <p>{"サポートする"}</p>
        <GiftIcon className="w-4" />
      </div>
    </Button>
  )
}
