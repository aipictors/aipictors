import { Link } from "~/lib/app/locale-router"
import { CheckCircle2Icon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type Props = {
  workId: string
  /** サムネイルが小さいときはアイコンだけ */
  isCompact: boolean
}

/**
 * 生成履歴の「投稿済み」の印。押すと作品を別のタブで開く
 */
export function GenerationPostedBadge(props: Props) {
  const t = useTranslation()
  const label = t("投稿済み", "Posted")

  return (
    <Link
      to={`/posts/${props.workId}`}
      target="_blank"
      rel="noopener noreferrer"
      title={t("投稿した作品を開く", "Open the posted work")}
      aria-label={label}
      onClick={(event) => event.stopPropagation()}
      className={cn(
        "absolute bottom-1 left-1 z-10 flex items-center gap-1 rounded-full bg-emerald-600/90 font-medium text-white shadow transition-colors hover:bg-emerald-600",
        props.isCompact ? "p-0.5" : "px-1.5 py-0.5 text-[11px] leading-4",
      )}
    >
      <CheckCircle2Icon className="size-3.5 shrink-0" />
      {!props.isCompact && label}
    </Link>
  )
}
