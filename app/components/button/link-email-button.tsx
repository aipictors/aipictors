import { Button, type ButtonProps } from "~/components/ui/button"
import { MailIcon } from "lucide-react"

type Props = ButtonProps

/**
 * メールリンク
 */
export function LinkEmailButton (props: Props): React.ReactNode {
  return (
    <Button aria-label={"email"} size={"icon"} {...props}>
      <MailIcon />
    </Button>
  )
}
