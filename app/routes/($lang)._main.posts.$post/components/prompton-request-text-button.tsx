import { Button } from "~/components/ui/button"
import { GiftIcon } from "lucide-react"

type Props = {
  promptonId: string
}

/**
 * 投稿者への支援ボタン
 */
export const PromptonRequestTextButton = ({ promptonId, ...rest }: Props) => {
  const onClick = () => {
    window.open(`https://prompton.io/aipic/${promptonId}`, "_blank")
  }

  return (
    <Button
      className="rounded-full"
      onClick={onClick}
      size={"sm"}
      variant={"secondary"}
      {...rest}
    >
      <div className="flex items-center space-x-2">
        <p>{"サポート"}</p>
        <GiftIcon className="w-4" />
      </div>
    </Button>
  )
}
