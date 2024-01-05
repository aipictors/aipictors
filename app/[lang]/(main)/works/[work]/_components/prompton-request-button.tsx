import { Button, ButtonProps } from "@/components/ui/button"

type Props = ButtonProps

/**
 * 投稿者への支援ボタン
 */
export const PromptonRequestButton = (props: Props) => {
  return (
    <Button variant={"destructive"} {...props}>
      {"支援"}
    </Button>
  )
}
