import { Button, type ButtonProps } from "@/_components/ui/button"
import { GiftIcon } from "lucide-react"

type Props = ButtonProps

/**
 * 投稿者への支援ボタン
 */
export const PromptonRequestButton = (props: Props) => {
  return (
    <Button size={"icon"} variant={"secondary"} {...props}>
      <GiftIcon className="w-4" />
    </Button>
  )
}
