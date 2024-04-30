import { Button, type ButtonProps } from "@/_components/ui/button"
import { RiTwitterXLine } from "@remixicon/react"

type Props = ButtonProps

/**
 * Twitter
 * @param props
 * @returns
 */
export const SocialTwitterButton = (props: Props) => {
  return (
    <Button aria-label={"twitter"} size={"icon"} {...props}>
      <RiTwitterXLine />
    </Button>
  )
}
