import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"

type Props = {
  onClick(): void
}

/**
 * ドット
 * @param props
 * @returns
 */
export const DotButton = (props: Props) => {
  return (
    <Button
      aria-label="menu"
      size={"icon"}
      variant={"ghost"}
      onClick={props.onClick}
    >
      <MoreHorizontal />
    </Button>
  )
}
