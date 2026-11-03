import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { graphql, type ResultOf } from "gql.tada"
import { BookOpenIcon, Heart, MessageCircle } from "lucide-react"
import { OptimizedImage } from "~/components/optimized-image"
import {
  toResizedImageSrcSet,
  toResizedImageUrl,
} from "~/utils/resized-image-url"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

export const ReadingWorkFragment = graphql(
  `fragment ReadingWork on WorkNode @_unmask {
    id
    title
    enTitle
    description
    likesCount
    commentsCount
    createdAt
    smallThumbnailImageURL
    smallThumbnailImageWidth
    user {
      id
      name
      iconUrl
    }
  }`,
)

export type ReadingWork = Omit<
  ResultOf<typeof ReadingWorkFragment>,
  "description" | "createdAt"
> & {
  /** 説明の抜粋 */
  excerpt: string
  /** 投稿日（JST）。サーバーとブラウザで同じになるように loader で文字にする */
  dateText: string
}

type Props = {
  work: ReadingWork
  to: string
  userTo: string
  isPriority?: boolean
}

/**
 * 読みものの作品カード（小説・コラム）
 * 画像より文字で選ぶものなので、題名とあらすじが読める横長にする。
 * 表紙の枠は CSS で先に決めるので、画像が読み終わっても並びがずれない
 */
export function ReadingWorkCard(props: Props) {
  const t = useTranslation()
  const { work } = props
  const imageUrl = work.smallThumbnailImageURL

  return (
    <article className="flex h-full gap-3 rounded-xl border bg-card p-2.5 transition-colors hover:bg-muted/50 md:gap-4 md:p-3">
      <Link
        to={props.to}
        tabIndex={-1}
        aria-hidden={true}
        className="relative block aspect-[3/4] w-20 shrink-0 self-start overflow-hidden rounded-lg bg-muted md:w-24"
      >
        {imageUrl ? (
          <OptimizedImage
            src={toResizedImageUrl(imageUrl, 240) ?? imageUrl}
            srcSet={toResizedImageSrcSet(imageUrl, {
              minWidth: 160,
              maxWidth: work.smallThumbnailImageWidth || undefined,
            })}
            sizes="96px"
            alt=""
            loading={props.isPriority ? "eager" : "lazy"}
            fetchPriority={props.isPriority ? "high" : undefined}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            <BookOpenIcon className="size-6" />
          </span>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="font-bold text-sm leading-snug md:text-base">
          <Link to={props.to} className="line-clamp-2 hover:underline">
            {t(work.title, work.enTitle || undefined)}
          </Link>
        </h3>
        {work.excerpt !== "" && (
          <p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed md:text-sm">
            {work.excerpt}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-muted-foreground text-xs">
          {work.user ? (
            <Link
              to={props.userTo}
              className="flex min-w-0 items-center gap-1.5 hover:text-foreground"
            >
              <img
                src={withIconUrlFallback(work.user.iconUrl)}
                alt=""
                width={20}
                height={20}
                loading="lazy"
                decoding="async"
                className="size-5 shrink-0 rounded-full object-cover"
              />
              <span className="truncate">{work.user.name}</span>
            </Link>
          ) : (
            <span />
          )}
          <span className="flex shrink-0 items-center gap-2">
            <span className="flex items-center gap-0.5">
              <Heart aria-hidden={true} className="size-3 fill-current" />
              {work.likesCount.toLocaleString()}
            </span>
            {work.commentsCount > 0 && (
              <span className="flex items-center gap-0.5">
                <MessageCircle aria-hidden={true} className="size-3" />
                {work.commentsCount.toLocaleString()}
              </span>
            )}
            <time>{work.dateText}</time>
          </span>
        </div>
      </div>
    </article>
  )
}
