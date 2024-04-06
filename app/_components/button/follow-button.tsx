import { Button, type ButtonProps } from "@/_components/ui/button"

type Props = ButtonProps

/**
 * フォロー
 * @param props
 * @returns
 */
export const FollowButton = (props: Props) => {
  return (
    <Button size={"sm"} {...props}>
      {"フォローする"}
    </Button>
  )
}
