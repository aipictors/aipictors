import { Button, type ButtonProps } from "~/components/ui/button"
import { ExternalLinkIcon } from "lucide-react"

type Props = ButtonProps

/**
 * 外部リンク
 */
export function LinkWebButton (props: Props): React.ReactNode {
  return (
    <Button aria-label={"email"} size={"icon"} {...props}>
      <ExternalLinkIcon />
    </Button>
  )
}
