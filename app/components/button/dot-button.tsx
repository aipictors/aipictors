import { Button } from "~/components/ui/button"
import { MoreHorizontalIcon } from "lucide-react"

type Props = {
  onClick(): void
}

/**
 * ドット
 */
export const DotButton = (props: Props) => {
  return (
    <Button
      aria-label="menu"
      size={"icon"}
      variant={"ghost"}
      onClick={props.onClick}
    >
      <MoreHorizontalIcon />
    </Button>
  )
}
