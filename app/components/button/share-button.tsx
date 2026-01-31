import { Button } from "~/components/ui/button"
import { ShareIcon } from "lucide-react"

/**
 * 共有
 */
export function ShareButton (): React.ReactNode {
  return (
    <Button aria-label="share" size={"icon"}>
      <ShareIcon />
    </Button>
  )
}
