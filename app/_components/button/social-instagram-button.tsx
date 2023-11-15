import { Button, ButtonProps } from "@/components/ui/button"
import { TbBrandInstagram } from "react-icons/tb"

type Props = ButtonProps

/**
 * Instagram
 * @param props
 * @returns
 */
export const SocialInstagramButton = (props: Props) => {
  return (
    <Button aria-label={"instagram"} size={"icon"} {...props}>
      <TbBrandInstagram />
    </Button>
  )
}
