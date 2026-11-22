import type { FragmentOf } from "gql.tada"
import { ChevronRightIcon, HeartIcon, ImagesIcon } from "lucide-react"
import { LikeButton } from "~/components/like-button"
import { WorkMediaBadge } from "~/components/work-media-badge"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import type { HomeWorkFragment } from "~/routes/($lang)._main._index/components/home-work-section"
import {
  toCoverImageSizes,
  toResizedImageSrcSet,
  toResizedImageUrl,
} from "~/utils/resized-image-url"

type Work = FragmentOf<typeof HomeWorkFragment>

/** ピックアップは元の画像の大きさも取る（サムネイルは短い辺が 600px で、大きく出すと足りない） */
type FeaturedWork = Work & { imageWidth?: number | null }

/** 枠の大きさ（画面幅ごと）。広い画面の指定を先に、一番狭い画面を最後に書く */
type CardSize = { media?: string; width: string; aspectRatio: number }

/** マイページの中身の最大幅（max-w-6xl から左右の余白を引いたもの） */
const CONTENT_MAX = 1088

/**
 * マイページの作品カード。作者は見れば分かるので出さず、絵を大きく見せる
 * タイトルは PC では乗せたときに、スマホでは常に出す
 */
function UserWorkCard(props: {
  work: FeaturedWork
  sizes: CardSize[]
  className?: string
  isPriority?: boolean
  /**
   * 元の画像から縮小する（ピックアップ）。
   * 600px のサムネイルを Retina や横長の絵の切り抜きで広げるとぼけるため。枚数が少ないので変換の費用は小さい
   */
  isOriginalSource?: boolean
  /** 枠いっぱいに表示する大きいカード。1920px 以上の縮小版も候補にする */
  isLarge?: boolean
  /** 全体を切らずに見せる（横長の枠に縦長の絵を置くとき）。余白はぼかした同じ絵で埋める */
  isContained?: boolean
}) {
  const t = useTranslation()
  const work = props.work
  const hasVideo = Boolean(work.url || work.streamUid)
  const imageAspectRatio =
    work.largeThumbnailImageWidth > 0 && work.largeThumbnailImageHeight > 0
      ? work.largeThumbnailImageWidth / work.largeThumbnailImageHeight
      : null
  // 全体を見せるときは枠に収まるので切り抜きの分は要らない
  const sizes = toCoverImageSizes(
    props.sizes,
    props.isContained ? null : imageAspectRatio,
  )

  return (
    <article
      className={cn(
        "group hover:-translate-y-0.5 relative isolate overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-border/40 transition duration-300 hover:shadow-xl",
        props.className,
      )}
    >
      <Link
        to={`/posts/${work.id}`}
        className="absolute inset-0 block focus-visible:outline-none"
        aria-label={work.title}
      >
        {props.isContained && (
          <img
            src={toResizedImageUrl(work.smallThumbnailImageURL, 240)}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 size-full scale-110 object-cover opacity-70 blur-2xl"
          />
        )}
        <img
          src={work.largeThumbnailImageURL}
          srcSet={
            props.isOriginalSource
              ? toResizedImageSrcSet(work.imageURL, {
                  minWidth: 240,
                  maxWidth: work.imageWidth || undefined,
                  large: props.isLarge,
                })
              : toResizedImageSrcSet(work.largeThumbnailImageURL, {
                  minWidth: 240,
                  maxWidth: work.largeThumbnailImageWidth,
                })
          }
          sizes={sizes}
          alt=""
          width={work.largeThumbnailImageWidth}
          height={work.largeThumbnailImageHeight}
          loading={props.isPriority ? "eager" : "lazy"}
          fetchPriority={props.isPriority ? "high" : undefined}
          decoding="async"
          className={cn(
            "relative size-full transition-transform duration-500 ease-out group-hover:scale-105",
            props.isContained
              ? "object-contain"
              : "object-cover object-[50%_20%]",
          )}
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-3 pt-10 pr-12 pb-2.5 text-white transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100 md:opacity-0">
          <p className="truncate font-bold text-sm drop-shadow">
            {t(work.title, work.enTitle || work.title)}
          </p>
          <p
            data-list-like-count
            className="mt-0.5 flex items-center gap-1 text-white/85 text-xs tabular-nums"
          >
            <HeartIcon className="size-3 fill-current" />
            {work.likesCount.toLocaleString()}
          </p>
        </div>
      </Link>
      <div className="pointer-events-none absolute inset-x-2 top-2 flex items-start justify-between gap-2">
        <WorkMediaBadge
          hasVideoUrl={hasVideo}
          isPromptPublic={work.promptAccessType === "PUBLIC"}
          isGeneration={work.isGeneration}
          size="sm"
        />
        {work.subWorksCount > 0 && (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-white text-xs tabular-nums backdrop-blur-sm">
            <ImagesIcon className="size-3" />
            {work.subWorksCount + 1}
          </span>
        )}
      </div>
      <div className="absolute right-0 bottom-0">
        <LikeButton
          size={48}
          targetWorkId={work.id}
          targetWorkOwnerUserId={work.user?.id ?? ""}
          defaultLiked={work.isLiked}
          defaultLikedCount={0}
          isBackgroundNone={true}
          strokeWidth={2}
        />
      </div>
    </article>
  )
}

export function UserWorksSection(props: {
  title: string
  link?: string
  /** 見出しの右に出すボタン（自分のプロフィールの「編集」など） */
  action?: React.ReactNode
  children: React.ReactNode
}) {
  const t = useTranslation()

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-lg tracking-tight md:text-xl">
          {props.title}
        </h2>
        {props.action}
        {props.link && (
          <Link
            to={props.link}
            className="flex shrink-0 items-center text-muted-foreground text-sm transition-colors hover:text-foreground"
          >
            {t("すべて見る", "See all")}
            <ChevronRightIcon className="size-4" />
          </Link>
        )}
      </div>
      {props.children}
    </section>
  )
}

/** 同じ大きさで並べる一覧 */
export function UserWorksGrid(props: { works: Work[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-4">
      {props.works.map((work) => (
        <UserWorkCard
          key={work.id}
          work={work}
          className="aspect-[4/5]"
          sizes={[
            { media: "(min-width: 1024px)", width: "280px", aspectRatio: 0.8 },
            { media: "(min-width: 640px)", width: "33vw", aspectRatio: 0.8 },
            { width: "50vw", aspectRatio: 0.8 },
          ]}
        />
      ))}
    </div>
  )
}

/**
 * 注目作品の並び。枚数に合わせて、隙間ができず絵が大きく切れないようにする
 * スマホは 2 列（奇数なら 1 枚目を全幅）。PC は 3 枚なら 3 列、5 枚なら 4 列で 1 枚目を 2 マス分
 */
const toFeaturedLayout = (count: number) => {
  const isOdd = count % 2 === 1
  const hasDesktopLead = count === 1 || count === 3 || count === 5
  return {
    gridClassName: cn(
      "grid grid-cols-2 gap-2 md:gap-3",
      count === 1 && "md:grid-cols-1",
      count === 2 && "md:grid-cols-2",
      count === 3 && "md:grid-cols-3",
      count >= 4 && "md:grid-cols-4",
    ),
    leadClassName: cn(
      isOdd ? "col-span-2 aspect-square" : "aspect-[4/5]",
      count === 1 && "md:aspect-[21/9]",
      (count === 3 || count === 5) && "md:col-span-2 md:row-span-2",
      count === 2 && "md:aspect-square",
    ),
    itemClassName: cn(
      hasDesktopLead ? "aspect-square" : "aspect-[4/5]",
      count === 2 && "md:aspect-square",
    ),
    hasLead: isOdd || count === 2,
    leadSizes: toFeaturedLeadSizes(count),
    itemSizes: toFeaturedItemSizes(count),
  }
}

const MD = "(min-width: 768px)"

/** 1 枚目の枠。toFeaturedLayout の leadClassName と合わせる */
const toFeaturedLeadSizes = (count: number): CardSize[] => {
  if (count === 1) {
    return [
      { media: MD, width: `min(100vw, ${CONTENT_MAX}px)`, aspectRatio: 21 / 9 },
      { width: "100vw", aspectRatio: 1 },
    ]
  }
  if (count === 2) {
    return [
      { media: MD, width: `min(50vw, ${CONTENT_MAX / 2}px)`, aspectRatio: 1 },
      { width: "50vw", aspectRatio: 0.8 },
    ]
  }
  if (count === 3) {
    return [
      {
        media: MD,
        width: `min(67vw, ${Math.round((CONTENT_MAX * 2) / 3)}px)`,
        aspectRatio: 1,
      },
      { width: "100vw", aspectRatio: 1 },
    ]
  }
  if (count === 5) {
    return [
      { media: MD, width: `min(50vw, ${CONTENT_MAX / 2}px)`, aspectRatio: 1 },
      { width: "100vw", aspectRatio: 1 },
    ]
  }
  return toFeaturedItemSizes(count)
}

/** 2 枚目以降の枠。toFeaturedLayout の itemClassName と合わせる */
const toFeaturedItemSizes = (count: number): CardSize[] => {
  const columns = count >= 4 ? 4 : Math.max(count, 1)
  const isSquareOnDesktop = count <= 3 || count === 5
  const isSquareOnMobile = count === 1 || count === 3 || count === 5
  return [
    {
      media: MD,
      width: `min(${Math.round(100 / columns)}vw, ${Math.round(CONTENT_MAX / columns)}px)`,
      aspectRatio: isSquareOnDesktop ? 1 : 0.8,
    },
    { width: "50vw", aspectRatio: isSquareOnMobile ? 1 : 0.8 },
  ]
}

/** 注目作品。1 枚を大きく見せる */
export function UserFeaturedWorks(props: { works: FeaturedWork[] }) {
  const layout = toFeaturedLayout(props.works.length)

  return (
    <div className={layout.gridClassName}>
      {props.works.map((work, index) => {
        const isLead = index === 0
        return (
          <UserWorkCard
            key={work.id}
            work={work}
            className={isLead ? layout.leadClassName : layout.itemClassName}
            isPriority={isLead}
            isOriginalSource
            isLarge={layout.hasLead && isLead}
            isContained={props.works.length === 1}
            sizes={
              layout.hasLead && isLead ? layout.leadSizes : layout.itemSizes
            }
          />
        )
      })}
    </div>
  )
}
