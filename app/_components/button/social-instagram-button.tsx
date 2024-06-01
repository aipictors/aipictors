import { Button, type ButtonProps } from "@/_components/ui/button"
import { RiInstagramLine } from "@remixicon/react"

type Props = ButtonProps

/**
 * Instagram
 */
export const SocialInstagramButton = (props: Props) => {
  return (
    <Button aria-label={"instagram"} size={"icon"} {...props}>
      <RiInstagramLine />
    </Button>
  )
}
