import { Button, ButtonProps } from "@/components/ui/button"

type Props = ButtonProps

/**
 * フォロー
 * @param props
 * @returns
 */
export const FollowButton = (props: Props) => {
  return (
    <Button className={"rounded-full"} size={"sm"} {...props}>
      {"フォローする"}
    </Button>
  )
}
