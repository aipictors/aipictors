import { Link } from "@remix-run/react"
import {
  CrownIcon,
  EyeIcon,
  HeartIcon,
  MessageCircleIcon,
  SparklesIcon,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { cn } from "~/lib/utils"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type RankingWork = {
  id: string
  title: string
  largeThumbnailImageURL: string | null
  smallThumbnailImageURL: string | null
  commentsCount: number
  viewsCount: number
  likesCount: number
  user: {
    name: string
    iconUrl: string | null
  } | null
}

type StandardRankingItem = {
  index: number
  snapshotLikedCount: number
  work: RankingWork | null
}

type AiRankingItem = {
  index: number
  overallScore: number
  work: RankingWork | null
}

type FeaturedWorkCardData = {
  id: string
  href: string
  title: string
  imageUrl: string | null
  userName: string
  userIconUrl: string | null
  likesCount: number
  commentsCount: number
  viewsCount: number
  rank: number
  rankLabel: string
  kindLabel: string
  badgeClassName: string
}

type Props = {
  standardRankings: StandardRankingItem[]
  aiRankings: AiRankingItem[]
}

function createStandardCardData(
  item: StandardRankingItem,
): FeaturedWorkCardData | null {
  if (!item.work) {
    return null
  }

  return {
    id: item.work.id,
    href: `/posts/${item.work.id}`,
    title: item.work.title,
    imageUrl: item.work.largeThumbnailImageURL ?? item.work.smallThumbnailImageURL,
    userName: item.work.user?.name ?? "不明なユーザー",
    userIconUrl: withIconUrlFallback(item.work.user?.iconUrl ?? null),
    likesCount: item.snapshotLikedCount,
    commentsCount: item.work.commentsCount,
    viewsCount: item.work.viewsCount,
    rank: item.index,
    rankLabel: `通常ランキング ${item.index}位`,
    kindLabel: "通常ランキング",
    badgeClassName:
      "border-slate-200/80 bg-white/90 text-slate-700 dark:border-white/15 dark:bg-slate-900/80 dark:text-slate-100",
  }
}

function createAiCardData(item: AiRankingItem): FeaturedWorkCardData | null {
  if (!item.work) {
    return null
  }

  return {
    id: item.work.id,
    href: `/posts/${item.work.id}`,
    title: item.work.title,
    imageUrl: item.work.largeThumbnailImageURL ?? item.work.smallThumbnailImageURL,
    userName: item.work.user?.name ?? "不明なユーザー",
    userIconUrl: withIconUrlFallback(item.work.user?.iconUrl ?? null),
    likesCount: item.work.likesCount,
    commentsCount: item.work.commentsCount,
    viewsCount: item.work.viewsCount,
    rank: item.index,
    rankLabel: `AIランキング ${item.index}位`,
    kindLabel: "AIランキング",
    badgeClassName:
      "border-amber-200/80 bg-white/90 text-amber-700 dark:border-white/15 dark:bg-amber-950/70 dark:text-amber-100",
  }
}

function FeaturedRankingBlock(props: {
  title: string
  items: FeaturedWorkCardData[]
  accentClassName: string
  icon: React.ComponentType<{ className?: string }>
}) {
  const primaryItem = props.items[0]
  const secondaryItems = props.items.slice(1, 5)
  const Icon = props.icon

  if (!primaryItem) {
    return null
  }

  return (
    <section className="space-y-3 rounded-[24px] border border-border/40 bg-white/80 p-3.5 shadow-sm backdrop-blur-sm dark:bg-zinc-950/60 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-3 py-1.5 font-semibold text-xs shadow-sm",
              props.accentClassName,
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{props.title}</span>
          </div>
        </div>
      </div>

      <Link
        to={primaryItem.href}
        className="group block w-full max-w-full overflow-hidden rounded-[24px] border border-border/50 bg-linear-to-br from-white via-slate-50 to-orange-50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:from-zinc-950 dark:via-zinc-900 dark:to-orange-950/30"
      >
        <div className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
          <div className="relative w-24 shrink-0 overflow-hidden rounded-[18px] bg-muted/30 sm:w-28 sm:rounded-[20px] md:w-[120px]">
            {primaryItem.imageUrl ? (
              <img
                src={primaryItem.imageUrl}
                alt={primaryItem.title}
                className="aspect-square h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
            ) : (
              <div className="aspect-square bg-muted" />
            )}
            <div className="absolute top-2 left-2 inline-flex max-w-[calc(100%-16px)] items-center gap-1 rounded-full bg-black/75 px-2 py-1 font-semibold text-[10px] text-white shadow-lg backdrop-blur-sm sm:top-2.5 sm:left-2.5 sm:gap-1.5 sm:px-2.5 sm:text-[11px]">
              <CrownIcon className="h-3 w-3 text-amber-300" />
              <span className="sm:hidden">1位</span>
              <span className="hidden sm:inline">{primaryItem.rankLabel}</span>
            </div>
          </div>

          <div className="min-w-0 w-[calc(100%-108px)] space-y-2 overflow-hidden sm:w-[calc(100%-128px)] md:flex-1 md:w-auto">
            <div className="min-w-0 space-y-1">
              <div className="hidden flex-wrap items-center gap-2 text-[11px] md:flex md:text-xs">
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-1 font-semibold",
                    primaryItem.badgeClassName,
                  )}
                >
                  {primaryItem.kindLabel}
                </span>
              </div>

              <h2 className="line-clamp-1 w-full max-w-full font-bold text-foreground text-sm leading-tight sm:line-clamp-2 sm:text-base">
                {primaryItem.title}
              </h2>
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <Avatar className="size-7 border border-white shadow-sm dark:border-zinc-800 sm:size-8">
                <AvatarImage src={primaryItem.userIconUrl ?? undefined} />
                <AvatarFallback>
                  {primaryItem.userName.slice(0, 1) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground text-xs sm:text-sm">
                  {primaryItem.userName}
                </p>
              </div>
            </div>

            <div className="flex max-w-full flex-wrap items-center gap-1.5 text-[11px] sm:text-xs">
              <div className="inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 shadow-sm text-muted-foreground sm:px-2.5">
                  <HeartIcon className="h-3.5 w-3.5" />
                  <span className="font-semibold text-foreground">{primaryItem.likesCount.toLocaleString()}</span>
              </div>
              <div className="hidden items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 shadow-sm text-muted-foreground sm:inline-flex">
                  <MessageCircleIcon className="h-3.5 w-3.5" />
                  <span className="font-semibold text-foreground">{primaryItem.commentsCount.toLocaleString()}</span>
              </div>
              <div className="hidden items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 shadow-sm text-muted-foreground sm:inline-flex">
                  <EyeIcon className="h-3.5 w-3.5" />
                  <span className="font-semibold text-foreground">{primaryItem.viewsCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {secondaryItems.length > 0 && (
        <div className="hidden space-y-2 sm:block">
          <p className="font-medium text-foreground text-sm">
            上位作品
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
              {secondaryItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  className="group flex min-w-0 gap-3 rounded-[20px] border border-border/40 bg-background/90 p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-muted/30">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted" />
                    )}
                    <div className="absolute top-2 left-2 rounded-full bg-black/75 px-2 py-0.5 font-semibold text-[10px] text-white">
                      #{item.rank}
                    </div>
                  </div>

                  <div className="min-w-0 space-y-2">
                    <p className="line-clamp-2 font-semibold text-foreground text-sm leading-5">
                      {item.title}
                    </p>
                    <p className="truncate text-muted-foreground text-xs">
                      {item.userName}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <HeartIcon className="h-3 w-3" />
                        {item.likesCount.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <EyeIcon className="h-3 w-3" />
                        {item.viewsCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}
    </section>
  )
}

export function FeaturedRankingsShowcase(props: Props) {
  const standardItems = props.standardRankings
    .map(createStandardCardData)
    .filter((item): item is FeaturedWorkCardData => item !== null)
  const aiItems = props.aiRankings
    .map(createAiCardData)
    .filter((item): item is FeaturedWorkCardData => item !== null)

  if (standardItems.length === 0 && aiItems.length === 0) {
    return null
  }

  return (
    <section className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-0">
      <div className="rounded-[28px] border border-border/40 bg-linear-to-br from-white via-slate-50 to-orange-50 px-4 py-4 shadow-sm dark:from-zinc-950 dark:via-zinc-950 dark:to-orange-950/30 sm:px-5 sm:py-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 font-semibold text-orange-700 text-xs dark:bg-orange-950/60 dark:text-orange-200">
              <SparklesIcon className="h-3.5 w-3.5" />
              <span>本日の注目ランキング</span>
            </div>
            <div>
              <h1 className="font-bold text-foreground text-xl sm:text-2xl">
                いま見てほしい上位作品
              </h1>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <FeaturedRankingBlock
            title="通常ランキング"
            items={standardItems}
            accentClassName="from-slate-900 via-slate-700 to-slate-600 text-white dark:from-slate-100 dark:via-slate-200 dark:to-slate-400 dark:text-slate-950"
            icon={CrownIcon}
          />
          <FeaturedRankingBlock
            title="AIランキング"
            items={aiItems}
            accentClassName="from-amber-500 via-orange-500 to-rose-500 text-white dark:from-amber-300 dark:via-orange-300 dark:to-rose-300 dark:text-amber-950"
            icon={SparklesIcon}
          />
        </div>
      </div>
    </section>
  )
}