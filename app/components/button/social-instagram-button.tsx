import { Button, type ButtonProps } from "~/components/ui/button"
import { RiInstagramLine } from "@remixicon/react"

type Props = ButtonProps

/**
 * Instagram
 */
export function SocialInstagramButton (props: Props): React.ReactNode {
  return (
    <Button aria-label={"instagram"} size={"icon"} {...props}>
      <RiInstagramLine />
    </Button>
  )
}
