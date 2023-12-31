import { Button, ButtonProps } from "@/components/ui/button"
import { Mail } from "lucide-react"

type Props = ButtonProps

/**
 * メールリンク
 * @param props
 * @returns
 */
export const LinkEmailButton = (props: Props) => {
  return (
    <Button aria-label={"email"} size={"icon"} {...props}>
      <Mail />
    </Button>
  )
}
