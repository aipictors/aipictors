import { Button, ButtonProps } from "@/components/ui/button"

type Props = ButtonProps

/**
 * 投稿者への支援ボタン
 */
export const PromptonRequestButton = (props: Props) => {
  return (
    <Button
      className={"rounded-full"}
      size={"sm"}
      variant={"secondary"}
      {...props}
    >
      {"支援"}
    </Button>
  )
}
