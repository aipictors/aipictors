import { Button, ButtonProps } from "@/components/ui/button"
import { TbBrandX } from "react-icons/tb"

type Props = ButtonProps

/**
 * Twitter
 * @param props
 * @returns
 */
export const SocialTwitterButton = (props: Props) => {
  return (
    <Button aria-label={"twitter"} size={"icon"} {...props}>
      <TbBrandX />
    </Button>
  )
}
