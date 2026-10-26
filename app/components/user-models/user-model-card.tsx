import { Link } from "@remix-run/react"
import { CheckIcon, ImageOffIcon, PlayIcon } from "lucide-react"
import { UserModelAuthor } from "~/components/user-models/user-model-author"
import {
  UserModelBaseBadge,
  UserModelKindBadge,
  UserModelRatingBadge,
} from "~/components/user-models/user-model-badges"
import { formatCount } from "~/lib/user-models/generation"
import type { UserModel } from "~/lib/user-models/types"
import { cn } from "~/lib/utils"

type Props = {
  model: UserModel
  /**
   * 指定するとリンクではなく選択ボタンとして動作する（生成画面のピッカー）
   */
  onSelect?(model: UserModel): void
  isSelected?: boolean
  /**
   * R-18 のサムネイルをぼかす
   */
  blurSensitive?: boolean
  className?: string
}

/**
 * みんなのモデルのカード
 */
export function UserModelCard(props: Props) {
  const { model } = props
  const isSensitive = model.rating === "R18" || model.rating === "R18G"

  const body = (
    <>
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        {model.thumbnailUrl ? (
          <img
            src={model.thumbnailUrl}
            alt={model.name}
            loading="lazy"
            draggable={false}
            className={cn(
              "size-full object-cover transition-transform duration-300 group-hover:scale-[1.04]",
              isSensitive && props.blurSensitive && "blur-xl",
            )}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOffIcon className="size-8 opacity-50" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          <UserModelKindBadge kind={model.kind} />
          <UserModelRatingBadge rating={model.rating} />
        </div>
        <div className="absolute top-2 right-2">
          <UserModelBaseBadge baseModel={model.baseModel} />
        </div>
        {props.isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/25">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <CheckIcon className="size-6" />
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 space-y-1 p-2.5 text-white">
          <p className="line-clamp-2 font-semibold text-sm leading-snug drop-shadow">
            {model.name}
          </p>
          <div className="flex items-center justify-between gap-2">
            <UserModelAuthor
              userId={model.userId}
              user={model.user}
              className="text-white/90"
            />
            <span
              className="flex shrink-0 items-center gap-0.5 text-white/90 text-xs"
              title="使用回数"
            >
              <PlayIcon className="size-3 fill-current" />
              {formatCount(model.useCount)}
            </span>
          </div>
        </div>
      </div>
    </>
  )

  const className = cn(
    "group hover:-translate-y-0.5 relative block overflow-hidden rounded-xl border bg-card text-left shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    props.isSelected &&
      "ring-2 ring-primary ring-offset-2 ring-offset-background",
    props.className,
  )

  if (props.onSelect) {
    return (
      <button
        type="button"
        className={cn(className, "w-full")}
        onClick={() => props.onSelect?.(model)}
        aria-pressed={props.isSelected}
      >
        {body}
      </button>
    )
  }

  return (
    <Link to={`/models/u/${model.id}`} className={className} prefetch="intent">
      {body}
    </Link>
  )
}

export function UserModelCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="aspect-[3/4] w-full animate-pulse bg-muted" />
    </div>
  )
}
