import { Button } from "@/_components/ui/button"

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
      {"支援"}
    </Button>
  )
}
