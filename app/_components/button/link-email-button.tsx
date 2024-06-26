import { Button, type ButtonProps } from "@/_components/ui/button"
import { MailIcon } from "lucide-react"

type Props = ButtonProps

/**
 * メールリンク
 */
export const LinkEmailButton = (props: Props) => {
  return (
    <Button aria-label={"email"} size={"icon"} {...props}>
      <MailIcon />
    </Button>
  )
}
