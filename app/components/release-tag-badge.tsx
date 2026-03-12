import { Badge } from "~/components/ui/badge"
import { Bug, RefreshCw, Wrench } from "lucide-react"
import { cn } from "~/lib/utils"
import type { FeaturedReleaseTag } from "~/utils/micro-cms-release"

type Props = {
  tag?: string | null
  className?: string
}

export const getReleaseTagMeta = (tag?: string | null) => {
  switch (tag) {
    case "アップデート":
      return {
        label: tag,
        icon: RefreshCw,
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
      }
    case "不具合対応":
      return {
        label: tag,
        icon: Bug,
        className:
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
      }
    case "メンテナンス":
      return {
        label: tag,
        icon: Wrench,
        className:
          "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300",
      }
    default:
      return null
  }
}

export function ReleaseTagBadge(props: Props) {
  const meta = getReleaseTagMeta(props.tag)

  if (!meta) {
    if (!props.tag) return null

    return (
      <Badge variant="secondary" className={props.className}>
        {props.tag}
      </Badge>
    )
  }

  const Icon = meta.icon

  return (
    <Badge
      variant="outline"
      className={cn("inline-flex items-center gap-1", meta.className, props.className)}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{meta.label}</span>
    </Badge>
  )
}

export type { FeaturedReleaseTag }