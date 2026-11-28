import { HeartIcon } from "lucide-react"
import { LikeButton } from "~/components/like-button"
import { OptimizedImage } from "~/components/optimized-image"
import {
  RANK_MEDAL_STYLES,
  RankCrown,
  RankMedalBadge,
} from "~/components/ranking/ranking-medal"
import { useTranslation } from "~/hooks/use-translation"
import { useViewerHiddenUserIds } from "~/hooks/use-viewer-hidden-user-ids"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { toResizedImageSrcSet } from "~/utils/resized-image-url"
import { toIconImageUrl } from "~/utils/with-icon-url-fallback"

/**
 * ランキングの 1 件（作品ランキングのページ・R18・トップのランキングタブで共通の形）
 */
export type RankingAwardItem = {
  /** 集計時点のいいね数（無いときは作品のいいね数） */
  snapshotLikedCount?: number | null
  work: {
    id: string
    title: string
    enTitle?: string | null
    smallThumbnailImageURL: string
    smallThumbnailImageWidth?: number | null
    largeThumbnailImageURL?: string | null
    largeThumbnailImageWidth?: number | null
    likesCount?: number | null
    rating?: string | null
    subWorksCount?: number | null
    isLiked?: boolean | null
    user?: { id: string; name: string; iconUrl?: string | null } | null
  } | null
}

const formatCount = (value: number) =>
  value >= 10000
    ? `${(value / 10000).toFixed(value >= 100000 ? 0 : 1)}万`
    : value.toLocaleString("ja-JP")

const likesOf = (item: RankingAwardItem) =>
  item.snapshotLikedCount ?? item.work?.likesCount ?? 0

function RankingUserLine(props: {
  user: NonNullable<NonNullable<RankingAwardItem["work"]>["user"]>
  size?: "sm" | "md"
  className?: string
}) {
  const iconSize = props.size === "sm" ? "size-4" : "size-5"
  return (
    <Link
      to={`/users/${props.user.id}`}
      className={cn(
        "relative z-10 flex min-w-0 items-center gap-1.5 text-muted-foreground hover:text-foreground",
        props.className,
      )}
    >
      <img
        src={toIconImageUrl(props.user.iconUrl)}
        alt=""
        loading="lazy"
        decoding="async"
        className={cn("shrink-0 rounded-full bg-muted object-cover", iconSize)}
      />
      <span className="truncate">{props.user.name}</span>
    </Link>
  )
}

function LikesCount(props: { count: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-extrabold tabular-nums",
        props.className,
      )}
    >
      <HeartIcon aria-hidden className="size-3.5 fill-pink-500 text-pink-500" />
      {formatCount(props.count)}
    </span>
  )
}

/** 表彰台の画像の縦横比（1 位がいちばん高い） */
const PODIUM_ASPECT = {
  1: "aspect-[3/4]",
  2: "aspect-[5/6]",
  3: "aspect-square",
} as const

/** ブロックした人・ミュートした人の作品の枠（順位の数字がずれないよう、枠は残して中身だけ伏せる） */
function HiddenWorkLabel() {
  const t = useTranslation()
  return (
    <p className="px-2 text-center text-muted-foreground text-xs">
      {t(
        "ミュート・ブロック中のユーザーの作品",
        "Work by a muted or blocked user",
      )}
    </p>
  )
}

/** ブロックした人と（作品を表示しない設定の）ミュートした人の作品か。ランキングはサーバーで未ログインとして取ってキャッシュしているので、ブラウザで見分ける */
function useIsHiddenItem() {
  const hiddenUserIds = useViewerHiddenUserIds()
  return (item: RankingAwardItem) => {
    const userId = item.work?.user?.id
    return userId !== undefined && hiddenUserIds.has(userId)
  }
}

function PodiumCard(props: {
  item: RankingAwardItem
  rank: 1 | 2 | 3
  isHidden?: boolean
}) {
  const t = useTranslation()
  const work = props.item.work
  if (!work) return <div />
  const style = RANK_MEDAL_STYLES[props.rank]
  if (props.isHidden) {
    return (
      <div
        className={cn(
          "relative flex min-w-0 flex-col items-center text-center",
          props.rank === 1
            ? "order-2"
            : props.rank === 2
              ? "order-1"
              : "order-3",
        )}
      >
        <RankCrown
          rank={props.rank}
          className={cn(
            "mb-1",
            props.rank === 1 ? "size-9 md:size-11" : "size-7 md:size-9",
          )}
        />
        <div
          className={cn(
            "relative flex w-full items-center justify-center rounded-2xl bg-muted ring-2 ring-offset-2 ring-offset-background md:rounded-3xl",
            style.ring,
            PODIUM_ASPECT[props.rank],
          )}
        >
          <HiddenWorkLabel />
          <RankMedalBadge
            rank={props.rank}
            className={cn(
              "-bottom-4 -translate-x-1/2 absolute left-1/2",
              props.rank === 1 && "size-11 text-lg",
            )}
          />
        </div>
      </div>
    )
  }
  const title = t.workTitle(work.title, work.enTitle)
  const imageUrl = work.largeThumbnailImageURL || work.smallThumbnailImageURL
  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-col items-center text-center",
        props.rank === 1 ? "order-2" : props.rank === 2 ? "order-1" : "order-3",
      )}
    >
      <Link
        to={`/posts/${work.id}`}
        className="absolute inset-0 z-0"
        aria-label={`${props.rank}位 ${title}`}
      />
      <RankCrown
        rank={props.rank}
        className={cn(
          "mb-1",
          props.rank === 1 ? "size-9 md:size-11" : "size-7 md:size-9",
        )}
      />
      <div
        className={cn(
          "pointer-events-none relative w-full rounded-2xl ring-2 ring-offset-2 ring-offset-background md:rounded-3xl",
          style.ring,
          style.glow,
          PODIUM_ASPECT[props.rank],
        )}
      >
        <OptimizedImage
          src={imageUrl}
          alt={title}
          // 表彰台はページの一番上に出る（一番大きく見える絵なので遅延させない）
          loading="eager"
          fetchPriority={props.rank === 1 ? "high" : undefined}
          srcSet={toResizedImageSrcSet(imageUrl, {
            minWidth: 240,
            maxWidth:
              work.largeThumbnailImageWidth ??
              work.smallThumbnailImageWidth ??
              undefined,
          })}
          sizes="(min-width: 1024px) 300px, 34vw"
          className="absolute inset-0 size-full rounded-2xl object-cover md:rounded-3xl"
        />
        {work.rating === "R15" && (
          <span className="absolute top-1.5 left-1.5 rounded-full bg-amber-500/90 px-1.5 py-0.5 font-bold text-[10px] text-white">
            R15
          </span>
        )}
        <RankMedalBadge
          rank={props.rank}
          className={cn(
            "-bottom-4 -translate-x-1/2 absolute left-1/2",
            props.rank === 1 && "size-11 text-lg",
          )}
        />
      </div>
      <p
        className={cn(
          "pointer-events-none mt-6 line-clamp-1 w-full font-extrabold",
          props.rank === 1 ? "text-sm md:text-base" : "text-xs md:text-sm",
        )}
      >
        {title}
      </p>
      {work.user && (
        <RankingUserLine
          user={work.user}
          size="sm"
          className="mt-1 max-w-full justify-center text-[11px] md:text-xs"
        />
      )}
      <div className="relative z-10 mt-1 flex items-center gap-1 text-xs">
        <LikesCount count={likesOf(props.item)} />
        <LikeButton
          size={32}
          targetWorkId={work.id}
          targetWorkOwnerUserId={work.user?.id ?? ""}
          defaultLiked={work.isLiked ?? false}
          defaultLikedCount={0}
          isBackgroundNone={true}
          strokeWidth={2}
        />
      </div>
    </div>
  )
}

/**
 * 1〜3 位の表彰台（2・1・3 の順に並べて、1 位をいちばん大きく）
 */
export function RankingPodium(props: {
  items: RankingAwardItem[]
  className?: string
}) {
  const isHiddenItem = useIsHiddenItem()
  const top = props.items.slice(0, 3)
  if (top.length === 0) return null
  return (
    <div
      className={cn(
        "rounded-3xl bg-gradient-to-b from-amber-100/70 via-amber-50/40 to-transparent px-3 pt-4 pb-3 md:px-8 md:pt-6 dark:from-amber-500/15 dark:via-amber-500/5",
        props.className,
      )}
    >
      <div className="mx-auto grid max-w-3xl grid-cols-3 items-end gap-2.5 md:gap-6 lg:max-w-2xl">
        {top.map((item, index) => (
          <PodiumCard
            key={item.work?.id ?? index}
            item={item}
            rank={(index + 1) as 1 | 2 | 3}
            isHidden={isHiddenItem(item)}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * 4 位以下の 1 件。スマホは番号・画像・情報の横並びの行、PC（lg 以上）は画像の大きいカード
 */
function RankingListItem(props: {
  item: RankingAwardItem
  rank: number
  isHidden?: boolean
}) {
  const t = useTranslation()
  const work = props.item.work
  if (!work) return null
  const title = t.workTitle(work.title, work.enTitle)
  const rankDigits = String(props.rank).length
  if (props.isHidden) {
    return (
      <li className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-2 lg:flex-col lg:items-stretch lg:gap-0 lg:overflow-hidden lg:p-0">
        <span className="w-11 shrink-0 text-center font-black text-foreground/60 text-lg italic tabular-nums lg:hidden">
          {props.rank}
        </span>
        <div className="relative flex h-20 min-w-0 flex-1 items-center justify-center rounded-xl bg-muted lg:aspect-square lg:h-auto lg:w-full lg:rounded-none">
          <span className="absolute top-2 left-2 hidden h-8 min-w-8 items-center justify-center rounded-full bg-black/65 px-2 font-black text-base text-white italic tabular-nums lg:inline-flex">
            {props.rank}
          </span>
          <HiddenWorkLabel />
        </div>
      </li>
    )
  }
  return (
    <li className="relative flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-2 transition-shadow hover:shadow-md lg:flex-col lg:items-stretch lg:gap-0 lg:overflow-hidden lg:p-0">
      <Link
        to={`/posts/${work.id}`}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={`${props.rank}位 ${title}`}
      />
      {/* スマホ: 左の大きな番号 */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none w-11 shrink-0 text-center font-black text-foreground/85 italic tabular-nums tracking-tighter lg:hidden",
          rankDigits === 1
            ? "text-3xl"
            : rankDigits === 2
              ? "text-2xl"
              : "text-lg",
        )}
      >
        {props.rank}
      </span>
      <div className="pointer-events-none relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted lg:aspect-square lg:size-auto lg:w-full lg:rounded-none">
        <OptimizedImage
          src={work.smallThumbnailImageURL}
          alt={title}
          loading="lazy"
          srcSet={toResizedImageSrcSet(work.smallThumbnailImageURL, {
            minWidth: 160,
            maxWidth: work.smallThumbnailImageWidth ?? undefined,
          })}
          sizes="(min-width: 1024px) 240px, 80px"
          className="absolute inset-0 size-full object-cover"
        />
        {/* PC: 画像の左上の番号 */}
        <span className="absolute top-2 left-2 hidden h-8 min-w-8 items-center justify-center rounded-full bg-black/65 px-2 font-black text-base text-white italic tabular-nums backdrop-blur-sm lg:inline-flex">
          {props.rank}
        </span>
        {(work.subWorksCount ?? 0) > 0 && (
          <span className="absolute top-2 right-2 hidden rounded-full bg-black/60 px-1.5 py-0.5 font-bold text-[10px] text-white lg:inline">
            +{work.subWorksCount}
          </span>
        )}
      </div>
      <div className="pointer-events-none min-w-0 flex-1 space-y-1.5 lg:space-y-1 lg:p-3">
        <p className="line-clamp-1 font-extrabold text-sm">{title}</p>
        {work.user && (
          <RankingUserLine
            user={work.user}
            className="pointer-events-auto text-xs"
          />
        )}
        <div className="flex items-center gap-2 text-xs">
          <LikesCount count={likesOf(props.item)} />
          {work.rating === "R15" && (
            <span className="rounded-full bg-amber-500/85 px-1.5 py-0.5 font-bold text-[10px] text-white">
              R15
            </span>
          )}
        </div>
      </div>
      <div className="relative z-10 shrink-0 lg:absolute lg:right-1 lg:bottom-1">
        <LikeButton
          size={36}
          targetWorkId={work.id}
          targetWorkOwnerUserId={work.user?.id ?? ""}
          defaultLiked={work.isLiked ?? false}
          defaultLikedCount={0}
          isBackgroundNone={true}
          strokeWidth={2}
        />
      </div>
    </li>
  )
}

/**
 * 4 位以下の一覧（startRank 位から）
 */
export function RankingList(props: {
  items: RankingAwardItem[]
  startRank: number
  className?: string
}) {
  const isHiddenItem = useIsHiddenItem()
  if (props.items.length === 0) return null
  return (
    <ol
      className={cn(
        "grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4 lg:gap-4 xl:grid-cols-5",
        props.className,
      )}
    >
      {props.items.map((item, index) => (
        <RankingListItem
          key={item.work?.id ?? index}
          item={item}
          rank={props.startRank + index}
          isHidden={isHiddenItem(item)}
        />
      ))}
    </ol>
  )
}
