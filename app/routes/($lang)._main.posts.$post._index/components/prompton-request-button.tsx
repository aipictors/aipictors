import { Button } from "~/components/ui/button"
import { GiftIcon } from "lucide-react"
import { redirect } from "@remix-run/node"

type Props = {
  promptonId: string
}

/**
 * 投稿者への支援ボタン
 */
export function PromptonRequestButton({ promptonId, ...rest }: Props) {
  const onClick = () => {
    redirect(`https://prompton.io/aipic/${promptonId}`)
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
