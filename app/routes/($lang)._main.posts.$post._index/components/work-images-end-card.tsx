import type { FragmentOf } from "gql.tada"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import type { workArticleFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-article"
import { toResizedImageSrcSet } from "~/utils/resized-image-url"

type Work = FragmentOf<typeof workArticleFragment>

/** 作者のほかの作品を何件出すか */
const AUTHOR_WORKS_COUNT = 6

type CardWork = {
  id: string
  title: string
  smallThumbnailImageURL: string
  smallThumbnailImageWidth: number
}

/**
 * 複数枚の作品で、最後の画像の「次」に出すカード（次の作品・作者のほかの作品）。
 * 以前は最後の画像の次で 1 枚目に戻り、画像送りを押し続けて離れる人が多かった
 */
export function WorkImagesEndCard(props: {
  work: Work
  /** R18 の作品ページ（リンクを /r にする） */
  isSensitive?: boolean
}) {
  const t = useTranslation()
  const prefix = props.isSensitive ? "/r" : ""
  const older = props.work.previousWork
  const newer = props.work.nextWork
  const authorWorks = (props.work.user?.works ?? [])
    .filter(
      (work) =>
        work.id !== props.work.id &&
        work.id !== older?.id &&
        work.id !== newer?.id,
    )
    .slice(0, AUTHOR_WORKS_COUNT)

  return (
    <div className="space-y-3">
      <p className="text-center font-bold text-sm">
        {t("最後の画像です", "That was the last image")}
      </p>
      {(older || newer) && (
        <div className="grid grid-cols-2 gap-2">
          {newer ? (
            <NeighborCard
              work={newer}
              to={`${prefix}/posts/${newer.id}`}
              label={t("新しい作品", "Newer")}
              direction="newer"
            />
          ) : (
            <div />
          )}
          {older ? (
            <NeighborCard
              work={older}
              to={`${prefix}/posts/${older.id}`}
              label={t("次の作品", "Next work")}
              direction="older"
            />
          ) : (
            <div />
          )}
        </div>
      )}
      {authorWorks.length > 0 && props.work.user && (
        <div className="space-y-2">
          <p className="truncate text-muted-foreground text-xs">
            {t(
              `${props.work.user.name} のほかの作品`,
              `More from ${props.work.user.name}`,
            )}
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {authorWorks.map((work) => (
              <Link
                key={work.id}
                to={`${prefix}/posts/${work.id}`}
                className="block overflow-hidden rounded-lg bg-muted"
                aria-label={work.title || t("作品を見る", "View work")}
              >
                <Thumbnail
                  work={{
                    id: work.id,
                    title: work.title ?? "",
                    smallThumbnailImageURL: work.smallThumbnailImageURL,
                    smallThumbnailImageWidth: work.smallThumbnailImageWidth,
                  }}
                  className="aspect-square w-full"
                  sizes="120px"
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Thumbnail(props: {
  work: CardWork
  className: string
  sizes: string
}) {
  return (
    <img
      src={props.work.smallThumbnailImageURL}
      srcSet={toResizedImageSrcSet(props.work.smallThumbnailImageURL, {
        minWidth: 96,
        maxWidth: props.work.smallThumbnailImageWidth || undefined,
      })}
      sizes={props.sizes}
      alt=""
      loading="lazy"
      decoding="async"
      className={cn("object-cover", props.className)}
    />
  )
}

function NeighborCard(props: {
  work: NonNullable<Work["nextWork"]>
  to: string
  label: string
  direction: "newer" | "older"
}) {
  const isOlder = props.direction === "older"
  return (
    <Link
      to={props.to}
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-xl border bg-card p-2 transition-colors hover:bg-muted",
        isOlder && "flex-row-reverse text-right",
      )}
    >
      {isOlder ? (
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
      ) : (
        <ChevronLeftIcon className="size-4 shrink-0 text-muted-foreground" />
      )}
      <Thumbnail
        work={props.work}
        className="size-12 shrink-0 rounded-lg bg-muted"
        sizes="96px"
      />
      <span className="flex min-w-0 flex-col">
        <span className="truncate whitespace-nowrap text-muted-foreground text-xs">
          {props.label}
        </span>
        <span className="truncate font-bold text-sm">{props.work.title}</span>
      </span>
    </Link>
  )
}
