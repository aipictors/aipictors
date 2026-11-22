import { ImageIcon, ThumbsUp } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { toElapsedTimeEnText } from "~/utils/to-elapsed-time-en-text"
import { toElapsedTimeText } from "~/utils/to-elapsed-time-text"
import { toResizedImageUrl } from "~/utils/resized-image-url"
import { toThumbnailObjectPosition } from "~/utils/thumbnail-object-position"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

export type NewCommentItem = {
  user: {
    id: string
    name: string
    login: string
    iconUrl: string | null
  } | null
  sticker: {
    id: string
    imageUrl: string | null
    title: string
  } | null
  work: {
    id: string
    title: string
    smallThumbnailImageURL: string | null
    smallThumbnailImageHeight: number | null
    smallThumbnailImageWidth: number | null
    thumbnailImagePosition: number | null
  } | null
  comment: {
    id: string
    text: string
    likesCount: number
    isLiked: boolean
  } | null
  createdAt: number
}

type Props = {
  item: NewCommentItem
  isLiked: boolean
  likesCount: number
  canLike: boolean
  onToggleLike: () => void
}

/**
 * 新着コメント 1 件（左に作品のサムネイル、右に「だれが・いつ・何を」）
 */
export function NewCommentCard(props: Props) {
  const t = useTranslation()

  const { item } = props

  const text = item.comment?.text?.trim() ?? ""

  const stickerUrl = item.sticker?.imageUrl ?? null

  // 「-」など名前のないスタンプは名前を出さない
  const stickerTitle =
    item.sticker?.title && item.sticker.title.trim() !== "-"
      ? item.sticker.title.trim()
      : null

  const workHref = item.work
    ? item.comment?.id
      ? `/posts/${item.work.id}#comment-${item.comment.id}`
      : `/posts/${item.work.id}`
    : null

  const userHref = item.user?.login ? `/users/${item.user.login}` : null

  const userName = item.user?.name || t("匿名", "Anonymous")

  const dateTimeText = toDateTimeText(item.createdAt)

  return (
    <article className="flex gap-3 py-3 sm:gap-4 sm:rounded-2xl sm:border sm:bg-card sm:p-4 sm:transition-colors sm:hover:bg-accent/30">
      {/* 作品のサムネイル */}
      {item.work && workHref ? (
        <Link
          to={workHref}
          className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:size-24"
          aria-label={t(
            `${item.work.title || "作品"}のコメントを見る`,
            `View comment on ${item.work.title || "the work"}`,
          )}
        >
          {item.work.smallThumbnailImageURL ? (
            <img
              src={toResizedImageUrl(item.work.smallThumbnailImageURL, 240)}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-300 hover:scale-105 motion-reduce:transition-none"
              style={{
                objectPosition: toThumbnailObjectPosition(
                  item.work.thumbnailImagePosition,
                  item.work.smallThumbnailImageWidth ?? 0,
                  item.work.smallThumbnailImageHeight ?? 0,
                ),
              }}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageIcon className="size-6" aria-hidden="true" />
            </span>
          )}
        </Link>
      ) : (
        <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground sm:size-24">
          <ImageIcon className="size-6" aria-hidden="true" />
        </span>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {/* だれが・いつ */}
        <div className="flex min-w-0 items-center gap-2 text-sm">
          {userHref ? (
            <Link
              to={userHref}
              className="flex min-w-0 items-center gap-2 hover:underline"
            >
              <img
                src={withIconUrlFallback(
                  toResizedImageUrl(item.user?.iconUrl ?? null, 64),
                )}
                alt=""
                loading="lazy"
                decoding="async"
                className="size-6 shrink-0 rounded-full border bg-muted object-cover"
              />
              <span className="truncate font-semibold">{userName}</span>
            </Link>
          ) : (
            <span className="truncate font-semibold">{userName}</span>
          )}
          <time
            dateTime={new Date(item.createdAt * 1000).toISOString()}
            title={dateTimeText}
            className="shrink-0 text-muted-foreground text-xs"
          >
            {t(
              toElapsedTimeText(item.createdAt),
              toElapsedTimeEnText(item.createdAt),
            )}
          </time>
        </div>

        {/* 何を（テキストとスタンプは吹き出しにまとめる） */}
        {(text.length > 0 || stickerUrl) && (
          <div className="w-fit max-w-full rounded-2xl rounded-tl-sm bg-muted px-3 py-2">
            {text.length > 0 && (
              <p className="line-clamp-6 whitespace-pre-wrap break-words text-sm leading-relaxed">
                {text}
              </p>
            )}
            {stickerUrl && (
              <img
                src={toResizedImageUrl(stickerUrl, 240)}
                alt={stickerTitle ?? t("スタンプ", "Sticker")}
                title={stickerTitle ?? undefined}
                loading="lazy"
                decoding="async"
                className={cn(
                  "size-16 rounded-lg object-contain sm:size-20",
                  text.length > 0 && "mt-2",
                )}
              />
            )}
          </div>
        )}

        {text.length === 0 && !stickerUrl && (
          <p className="text-muted-foreground text-xs italic">
            {t("(コメント内容なし)", "(No comment content)")}
          </p>
        )}

        {/* どの作品に・いいね */}
        <div className="flex min-w-0 items-center gap-2 text-xs">
          {item.work && workHref && (
            <Link
              to={workHref}
              className="flex min-w-0 items-center gap-1 text-muted-foreground hover:text-foreground hover:underline"
            >
              <ImageIcon className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {item.work.title || t("無題の作品", "Untitled")}
              </span>
            </Link>
          )}
          {item.comment?.id && (
            <button
              type="button"
              onClick={props.onToggleLike}
              disabled={!props.canLike}
              aria-pressed={props.isLiked}
              aria-label={t("コメントにいいね", "Like comment")}
              title={
                props.canLike
                  ? undefined
                  : t("ログインするといいねできます", "Log in to like")
              }
              className={cn(
                "ml-auto flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60",
                props.isLiked ? "text-primary" : "text-muted-foreground",
              )}
            >
              <ThumbsUp
                className={cn("size-4", props.isLiked && "fill-primary")}
                aria-hidden="true"
              />
              <span className="tabular-nums">{props.likesCount}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
