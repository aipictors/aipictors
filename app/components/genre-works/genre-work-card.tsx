import { type FragmentOf, graphql } from "gql.tada"
import { Heart } from "lucide-react"
import { OptimizedImage } from "~/components/optimized-image"
import { WorkMediaBadge } from "~/components/work-media-badge"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import {
  toResizedImageSrcSet,
  toResizedImageUrl,
} from "~/utils/resized-image-url"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  work: FragmentOf<typeof GenreWorkCardFragment>
  to: string
  userTo: string
  /** 縦横比（Tailwind のクラス） */
  aspectClassName: string
  /** sizes の書式の表示幅 */
  sizes: string
  /** 順位（1 始まり）。あれば画像の左上に出す */
  rank?: number
}

const RANK_CLASS_NAMES: Record<number, string> = {
  1: "bg-amber-400 text-amber-950",
  2: "bg-slate-300 text-slate-900",
  3: "bg-orange-400 text-orange-950",
}

/**
 * ジャンルの入口の作品カード
 * 枠の縦横比を CSS で先に決めるので、画像が読み終わっても並びがずれない
 */
export function GenreWorkCard(props: Props) {
  const t = useTranslation()
  const { work } = props

  const imageUrl = work.smallThumbnailImageURL

  return (
    <article className="min-w-0 space-y-1.5">
      <Link
        to={props.to}
        className={cn(
          "group relative block overflow-hidden rounded-xl bg-muted",
          props.aspectClassName,
        )}
      >
        <OptimizedImage
          src={toResizedImageUrl(imageUrl, 320) ?? imageUrl}
          srcSet={toResizedImageSrcSet(imageUrl, {
            minWidth: 160,
            maxWidth: work.smallThumbnailImageWidth || undefined,
          })}
          sizes={props.sizes}
          alt={t.workTitle(work.title, work.enTitle)}
          width={work.smallThumbnailImageWidth}
          height={work.smallThumbnailImageHeight}
          className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {props.rank !== undefined && (
          <span
            className={cn(
              "absolute top-1.5 left-1.5 flex size-7 items-center justify-center rounded-full font-bold text-sm shadow",
              RANK_CLASS_NAMES[props.rank] ?? "bg-black/65 text-white",
            )}
          >
            {props.rank}
          </span>
        )}
        <span className="pointer-events-none absolute bottom-1.5 left-1">
          <WorkMediaBadge
            isPromptPublic={work.promptAccessType === "PUBLIC"}
            hasVideoUrl={Boolean(work.url)}
            isGeneration={work.isGeneration}
            hasReferenceButton={false}
            size="md"
          />
        </span>
      </Link>
      <Link to={props.to} className="block truncate font-bold text-sm">
        {t.workTitle(work.title, work.enTitle)}
      </Link>
      <div className="flex items-center justify-between gap-2">
        {work.user ? (
          <Link
            to={props.userTo}
            className="flex min-w-0 items-center gap-1.5 text-muted-foreground text-xs hover:text-foreground"
          >
            <img
              src={toResizedImageUrl(
                withIconUrlFallback(work.user.iconUrl),
                96,
              )}
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
        <span
          data-list-like-count
          className="flex shrink-0 items-center gap-0.5 text-muted-foreground text-xs"
        >
          <Heart className="size-3 fill-current" />
          {work.likesCount.toLocaleString()}
        </span>
      </div>
    </article>
  )
}

export const GenreWorkCardFragment = graphql(
  `fragment GenreWorkCard on WorkNode @_unmask {
    id
    title
    enTitle
    likesCount
    url
    isGeneration
    promptAccessType
    smallThumbnailImageURL
    smallThumbnailImageWidth
    smallThumbnailImageHeight
    largeThumbnailImageURL
    largeThumbnailImageWidth
    largeThumbnailImageHeight
    user {
      id
      name
      iconUrl
    }
  }`,
)

/**
 * サーバーで描く新着一覧（ResponsivePhotoWorksAlbum）が読む項目だけ
 * PhotoAlbumWork は作品ページ用の項目（いいねした人 64 人・プロンプトなど）まで含み、
 * 24 件で HTML が数十 KB 増えるので分けている
 */
export const GenreNewWorkFragment = graphql(
  `fragment GenreNewWork on WorkNode @_unmask {
    id
    title
    enTitle
    likesCount
    commentsCount
    isLiked
    isSensitive
    rating
    isGeneration
    promptAccessType
    url
    streamUid
    subWorksCount
    thumbnailImagePosition
    largeThumbnailImageURL
    largeThumbnailImageWidth
    largeThumbnailImageHeight
    smallThumbnailImageURL
    smallThumbnailImageWidth
    smallThumbnailImageHeight
    user {
      id
      name
      iconUrl
      avatarFrame {
        id
        frameType
        backgroundStyle
        overlayImageUrl
        borderPadding
      }
    }
  }`,
)
