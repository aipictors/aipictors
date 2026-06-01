import { Link } from "@remix-run/react"
import type { FragmentOf } from "gql.tada"
import {
  CrownIcon,
  EyeIcon,
  HeartIcon,
  MessageCircleIcon,
  SparklesIcon,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { cn } from "~/lib/utils"
import type { AiEvaluationRankingListItemFragment } from "~/routes/($lang)._main.ai-rankings._index/components/ai-evaluation-ranking-work-list"
import type { WorkAwardListItemFragment } from "~/routes/($lang)._main.rankings._index/components/ranking-work-list"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type StandardRankingItem = FragmentOf<typeof WorkAwardListItemFragment>
type AiRankingItem = FragmentOf<typeof AiEvaluationRankingListItemFragment>

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
  accentClassName: string
  badgeClassName: string
  helperText: string
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
    accentClassName:
      "from-slate-900 via-slate-700 to-slate-600 text-white dark:from-slate-100 dark:via-slate-200 dark:to-slate-400 dark:text-slate-950",
    badgeClassName:
      "border-slate-200/80 bg-white/90 text-slate-700 dark:border-white/15 dark:bg-slate-900/80 dark:text-slate-100",
    helperText: "いま最も反応を集めている通常ランキング上位作品",
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
    accentClassName:
      "from-amber-500 via-orange-500 to-rose-500 text-white dark:from-amber-300 dark:via-orange-300 dark:to-rose-300 dark:text-amber-950",
    badgeClassName:
      "border-amber-200/80 bg-white/90 text-amber-700 dark:border-white/15 dark:bg-amber-950/70 dark:text-amber-100",
    helperText: `AI評価 ${item.overallScore}点の注目作品`,
  }
}

function FeaturedRankingBlock(props: {
  title: string
  description: string
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
    <section className="space-y-4 rounded-[28px] border border-border/40 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:bg-zinc-950/60 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-3 py-1.5 font-semibold text-xs shadow-sm",
              props.accentClassName,
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{props.title}</span>
          </div>
          <p className="text-muted-foreground text-sm leading-6">
            {props.description}
          </p>
        </div>
        <span className="hidden rounded-full border border-border/50 bg-background/80 px-3 py-1 text-[11px] text-muted-foreground md:inline-flex">
          上位作品を先に表示
        </span>
      </div>

      <Link
        to={primaryItem.href}
        className="group block overflow-hidden rounded-[28px] border border-border/50 bg-linear-to-br from-white via-slate-50 to-orange-50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:from-zinc-950 dark:via-zinc-900 dark:to-orange-950/30"
      >
        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
          <div className="relative overflow-hidden rounded-[24px] bg-muted/30">
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
            <div className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/75 px-3 py-1.5 font-semibold text-white text-xs shadow-lg backdrop-blur-sm">
              <CrownIcon className="h-3.5 w-3.5 text-amber-300" />
              <span>{primaryItem.rankLabel}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-1 font-semibold",
                    primaryItem.badgeClassName,
                  )}
                >
                  {primaryItem.kindLabel}
                </span>
                <span className="rounded-full bg-foreground/5 px-2.5 py-1 text-muted-foreground dark:bg-white/5">
                  {primaryItem.helperText}
                </span>
              </div>

              <h2 className="line-clamp-2 font-bold text-foreground text-xl leading-tight sm:text-2xl">
                {primaryItem.title}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <Avatar className="size-11 border border-white shadow-sm dark:border-zinc-800">
                <AvatarImage src={primaryItem.userIconUrl ?? undefined} />
                <AvatarFallback>
                  {primaryItem.userName.slice(0, 1) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground text-sm sm:text-base">
                  {primaryItem.userName}
                </p>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  投稿者
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
              <div className="rounded-2xl bg-background/80 px-3 py-2.5 shadow-sm">
                <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
                  <HeartIcon className="h-3.5 w-3.5" />
                  <span>いいね</span>
                </div>
                <p className="font-semibold text-foreground">{primaryItem.likesCount.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-background/80 px-3 py-2.5 shadow-sm">
                <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
                  <MessageCircleIcon className="h-3.5 w-3.5" />
                  <span>コメント</span>
                </div>
                <p className="font-semibold text-foreground">{primaryItem.commentsCount.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-background/80 px-3 py-2.5 shadow-sm">
                <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
                  <EyeIcon className="h-3.5 w-3.5" />
                  <span>閲覧</span>
                </div>
                <p className="font-semibold text-foreground">{primaryItem.viewsCount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {secondaryItems.length > 0 && (
        <div className="space-y-2">
          <p className="font-medium text-foreground text-sm">
            2位以降もチェック
          </p>
          <div className="overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex gap-3 pr-2">
              {secondaryItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  className="group flex min-w-64 max-w-64 gap-3 rounded-[22px] border border-border/40 bg-background/90 p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
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
      <div className="overflow-hidden rounded-[32px] border border-border/40 bg-linear-to-br from-white via-slate-50 to-orange-50 px-4 py-5 shadow-sm dark:from-zinc-950 dark:via-zinc-950 dark:to-orange-950/30 sm:px-6 sm:py-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 font-semibold text-orange-700 text-xs dark:bg-orange-950/60 dark:text-orange-200">
              <SparklesIcon className="h-3.5 w-3.5" />
              <span>本日の注目ランキング</span>
            </div>
            <div>
              <h1 className="font-bold text-foreground text-2xl sm:text-3xl">
                いま見てほしい上位作品
              </h1>
              <p className="max-w-3xl text-muted-foreground text-sm leading-6 sm:text-base">
                操作UIより先に、通常ランキングとAIランキングの上位作品を並べて表示します。ファーストビューで主役になるのは作品です。
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <FeaturedRankingBlock
            title="通常ランキング"
            description="通常ランキング 1位を大きく表示し、続く上位作品も横スクロールでたどれます。"
            items={standardItems}
            accentClassName="from-slate-900 via-slate-700 to-slate-600 text-white dark:from-slate-100 dark:via-slate-200 dark:to-slate-400 dark:text-slate-950"
            icon={CrownIcon}
          />
          <FeaturedRankingBlock
            title="AIランキング"
            description="AI評価の上位作品も同じ導線で並べて、自然に比較できる構成にしています。"
            items={aiItems}
            accentClassName="from-amber-500 via-orange-500 to-rose-500 text-white dark:from-amber-300 dark:via-orange-300 dark:to-rose-300 dark:text-amber-950"
            icon={SparklesIcon}
          />
        </div>
      </div>
    </section>
  )
}