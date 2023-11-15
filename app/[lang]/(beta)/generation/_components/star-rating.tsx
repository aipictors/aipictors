import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

type Props = {
  value: number
  onChange(value: number): void
}

/**
 * レーティング
 * @param props
 * @returns
 */
export const StarRating = (props: Props) => {
  return (
    <div>
      <Button
        aria-label={"お気に入り"}
        size={"icon"}
        className="ghost"
        onClick={() => {
          props.onChange(1)
        }}
      >
        <Star className={cn(0 < props.value && "fill-yellow-500")} />
      </Button>
      <Button
        aria-label={"お気に入り"}
        size={"icon"}
        className="ghost"
        onClick={() => {
          props.onChange(2)
        }}
      >
        <Star className={cn(1 < props.value && "fill-yellow-500")} />
      </Button>
      <Button
        aria-label={"お気に入り"}
        size={"icon"}
        className="ghost"
        onClick={() => {
          props.onChange(3)
        }}
      >
        <Star className={cn(2 < props.value && "fill-yellow-500")} />
      </Button>
      <Button
        aria-label={"お気に入り"}
        size={"icon"}
        className="ghost"
        onClick={() => {
          props.onChange(4)
        }}
      >
        <Star className={cn(3 < props.value && "fill-yellow-500")} />
      </Button>
      <Button
        aria-label={"お気に入り"}
        size={"icon"}
        className="ghost"
        onClick={() => {
          props.onChange(5)
        }}
      >
        <Star className={cn(4 < props.value && "fill-yellow-500")} />
      </Button>
    </div>
  )
}
