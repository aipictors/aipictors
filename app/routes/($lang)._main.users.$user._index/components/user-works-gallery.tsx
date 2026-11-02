import { Link } from "@remix-run/react"
import type { FragmentOf } from "gql.tada"
import { ChevronRightIcon, HeartIcon, ImagesIcon } from "lucide-react"
import { LikeButton } from "~/components/like-button"
import { WorkMediaBadge } from "~/components/work-media-badge"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import type { HomeWorkFragment } from "~/routes/($lang)._main._index/components/home-work-section"
import { toResizedImageSrcSet } from "~/utils/resized-image-url"

type Work = FragmentOf<typeof HomeWorkFragment>

/**
 * マイページの作品カード。作者は見れば分かるので出さず、絵を大きく見せる
 * タイトルは PC では乗せたときに、スマホでは常に出す
 */
function UserWorkCard(props: {
  work: Work
  sizes: string
  className?: string
  isPriority?: boolean
  /** 大きく見せるカード。サムネイルでは足りないので元の画像から縮小する */
  isLarge?: boolean
  /** 全体を切らずに見せる（横長の枠に縦長の絵を置くとき）。余白はぼかした同じ絵で埋める */
  isContained?: boolean
}) {
  const t = useTranslation()
  const work = props.work
  const hasVideo = Boolean(work.url || work.streamUid)

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
            src={work.smallThumbnailImageURL}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 size-full scale-110 object-cover opacity-70 blur-2xl"
          />
        )}
        <img
          src={work.largeThumbnailImageURL}
          srcSet={
            props.isLarge
              ? toResizedImageSrcSet(work.imageURL, { minWidth: 480 })
              : toResizedImageSrcSet(work.largeThumbnailImageURL, {
                  minWidth: 240,
                  maxWidth: work.largeThumbnailImageWidth,
                })
          }
          sizes={props.sizes}
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
          <p className="mt-0.5 flex items-center gap-1 text-white/85 text-xs tabular-nums">
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
  children: React.ReactNode
}) {
  const t = useTranslation()

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-lg tracking-tight md:text-xl">
          {props.title}
        </h2>
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
          sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
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
  }
}

/** 注目作品。1 枚を大きく見せる */
export function UserFeaturedWorks(props: { works: Work[] }) {
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
            isLarge={layout.hasLead && isLead}
            isContained={props.works.length === 1}
            sizes={
              layout.hasLead && isLead
                ? "(min-width: 768px) 620px, 100vw"
                : "(min-width: 768px) 300px, 50vw"
            }
          />
        )
      })}
    </div>
  )
}
