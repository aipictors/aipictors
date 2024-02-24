import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { StarIcon } from "lucide-react"

type Props = {
  isActive: boolean
  onClick(): void
}

export const StarButton = (props: Props) => {
  return (
    <Button
      onClick={props.onClick}
      aria-label={"お気に入り"}
      size={"icon"}
      variant="ghost"
    >
      <StarIcon className={cn(props.isActive ? "fill-yellow-500" : "")} />
    </Button>
  )
}
