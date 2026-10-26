import {
  baseModelLabel,
  kindLabel,
  ratingLabel,
} from "~/lib/user-models/constants"
import type { UserModel } from "~/lib/user-models/types"
import { cn } from "~/lib/utils"

type KindProps = {
  kind: UserModel["kind"]
  className?: string
}

export function UserModelKindBadge(props: KindProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 font-bold text-[10px] uppercase leading-none tracking-wide",
        props.kind === "LORA"
          ? "bg-violet-500 text-white"
          : "bg-sky-500 text-white",
        props.className,
      )}
    >
      {kindLabel(props.kind)}
    </span>
  )
}

type BaseProps = {
  baseModel: UserModel["baseModel"]
  className?: string
}

export function UserModelBaseBadge(props: BaseProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-black/55 px-1.5 py-0.5 font-medium text-[10px] text-white leading-none backdrop-blur-sm",
        props.className,
      )}
    >
      {baseModelLabel(props.baseModel)}
    </span>
  )
}

type RatingProps = {
  rating: UserModel["rating"]
  className?: string
}

export function UserModelRatingBadge(props: RatingProps) {
  if (props.rating === "G") return null
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 font-bold text-[10px] leading-none",
        props.rating === "R15"
          ? "bg-amber-500 text-white"
          : "bg-rose-600 text-white",
        props.className,
      )}
    >
      {ratingLabel(props.rating)}
    </span>
  )
}
