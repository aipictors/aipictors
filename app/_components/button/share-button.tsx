import { Button } from "@/components/ui/button"
import { Share } from "lucide-react"

/**
 * 共有
 * @returns
 */
export const ShareButton = () => {
  return (
    <Button aria-label="share" size={"icon"}>
      <Share />
    </Button>
  )
}
