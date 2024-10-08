import { Button, type ButtonProps } from "~/components/ui/button"
import { RiTwitterXLine } from "@remixicon/react"

type Props = ButtonProps

/**
 * Twitter
 */
export function SocialTwitterButton(props: Props) {
  return (
    <Button aria-label={"twitter"} size={"icon"} {...props}>
      <RiTwitterXLine />
    </Button>
  )
}
