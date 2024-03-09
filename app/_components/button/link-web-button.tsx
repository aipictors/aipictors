import { Button, type ButtonProps } from "@/components/ui/button"
import { ExternalLinkIcon } from "lucide-react"

type Props = ButtonProps

/**
 * 外部リンク
 * @param props
 * @returns
 */
export const LinkWebButton = (props: Props) => {
  return (
    <Button aria-label={"email"} size={"icon"} {...props}>
      <ExternalLinkIcon />
    </Button>
  )
}
