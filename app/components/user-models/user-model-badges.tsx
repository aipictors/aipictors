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

type StatusProps = {
  status: UserModel["status"]
  className?: string
}

const statusLabels: Record<UserModel["status"], string> = {
  READY: "公開中",
  UPLOADING: "アップロード未完了",
  DISABLED: "無効",
  DELETED: "削除済み",
}

export function UserModelStatusBadge(props: StatusProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-[11px]",
        props.status === "READY" &&
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        props.status === "UPLOADING" &&
          "bg-amber-500/10 text-amber-700 dark:text-amber-400",
        (props.status === "DISABLED" || props.status === "DELETED") &&
          "bg-destructive/10 text-destructive",
        props.className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          props.status === "READY" && "bg-emerald-500",
          props.status === "UPLOADING" && "bg-amber-500",
          (props.status === "DISABLED" || props.status === "DELETED") &&
            "bg-destructive",
        )}
      />
      {statusLabels[props.status]}
    </span>
  )
}
