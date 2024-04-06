import { Button, type ButtonProps } from "@/_components/ui/button"

type Props = ButtonProps

/**
 * 投稿者への支援ボタン
 */
export const PromptonRequestButton = (props: Props) => {
  return (
    <Button size={"sm"} variant={"secondary"} {...props}>
      {"支援"}
    </Button>
  )
}
