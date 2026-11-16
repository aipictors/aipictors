import { ChevronRightIcon, CrownIcon } from "lucide-react"
import { useEffect, useState } from "react"
import {
  appPillRowClassName,
  appPillTabClassName,
} from "~/components/app/app-pill-tab"
import {
  RankingList,
  RankingPodium,
} from "~/components/ranking/ranking-awards-view"
import { Skeleton } from "~/components/ui/skeleton"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import type {
  HomeRankingPeriod,
  HomeRankingResponse,
} from "~/routes/api.home-rankings/route"

const PERIODS: HomeRankingPeriod[] = ["daily", "weekly", "monthly"]

/** 一度読んだ期間はタブを切り替えても読み直さない（ページを開いている間）。全年齢と R18 は別に覚える */
const loadedRankingsByRating = {
  all: new Map<HomeRankingPeriod, HomeRankingResponse>(),
  r18: new Map<HomeRankingPeriod, HomeRankingResponse>(),
}

const periodTitle = (
  t: ReturnType<typeof useTranslation>,
  ranking: HomeRankingResponse,
) => {
  if (ranking.day !== undefined) {
    return `${ranking.month}月${ranking.day}日`
  }
  if (ranking.weekIndex !== undefined) {
    return `${ranking.month}月 第${ranking.weekIndex}週`
  }
  return t(
    `${ranking.year}年${ranking.month}月`,
    `${ranking.year}/${ranking.month}`,
  )
}

/**
 * トップの「ランキング」タブ（ページを移らずにタブの中で出す）
 *
 * 選んだときに初めて読む。中身は全員同じなので /api/home-rankings が拠点のキャッシュから返す
 */
export function HomeRankingTabContent(props: {
  /** R18 のトップ（R18 の集計を出し、リンクを /r に） */
  isSensitive?: boolean
}) {
  const t = useTranslation()
  const loadedRankings = props.isSensitive
    ? loadedRankingsByRating.r18
    : loadedRankingsByRating.all
  const rankingsPath = props.isSensitive ? "/r/rankings" : "/rankings"
  const [period, setPeriod] = useState<HomeRankingPeriod>("daily")
  const [rankings, setRankings] = useState(() => new Map(loadedRankings))
  const [failedPeriod, setFailedPeriod] = useState<HomeRankingPeriod | null>(
    null,
  )
  const ranking = rankings.get(period)

  useEffect(() => {
    if (loadedRankings.has(period)) return
    let isCancelled = false
    setFailedPeriod(null)
    fetch(
      `/api/home-rankings?period=${period}${props.isSensitive ? "&sensitive=1" : ""}`,
    )
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status))
        return (await response.json()) as HomeRankingResponse
      })
      .then((data) => {
        loadedRankings.set(period, data)
        if (!isCancelled) setRankings(new Map(loadedRankings))
      })
      .catch(() => {
        if (!isCancelled) setFailedPeriod(period)
      })
    return () => {
      isCancelled = true
    }
  }, [period, loadedRankings, props.isSensitive])

  const labels: Record<HomeRankingPeriod, string> = {
    daily: t("デイリー", "Daily"),
    weekly: t("ウィークリー", "Weekly"),
    monthly: t("マンスリー", "Monthly"),
  }

  return (
    <section
      aria-label={t("ランキング", "Rankings")}
      className="fade-in-0 animate-in space-y-4 pb-6 duration-200"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFE08A] to-[#E2A21B]"
          >
            <CrownIcon className="size-5 fill-white/40 text-white" />
          </span>
          <div className="min-w-0">
            <h2 className="font-black text-lg leading-tight">
              {t("ランキング", "Rankings")}
            </h2>
            <p className="truncate font-bold text-muted-foreground text-xs">
              {ranking ? periodTitle(t, ranking) : " "}
            </p>
          </div>
        </div>
        <Link
          to={ranking?.href ?? rankingsPath}
          className="inline-flex shrink-0 items-center gap-0.5 font-bold text-clear-bright-blue text-sm hover:opacity-80"
        >
          {t("もっと見る", "See all")}
          <ChevronRightIcon className="size-4" />
        </Link>
      </div>

      <div className={appPillRowClassName} role="tablist">
        {PERIODS.map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={period === value}
            onClick={() => setPeriod(value)}
            className={cn(
              appPillTabClassName(period === value),
              "flex-1 sm:flex-none",
            )}
          >
            {labels[value]}
          </button>
        ))}
      </div>

      {ranking ? (
        ranking.items.length > 0 ? (
          <div className="space-y-4">
            <RankingPodium items={ranking.items} />
            <RankingList items={ranking.items.slice(3)} startRank={4} />
            <Link
              to={ranking.href}
              className="flex h-12 items-center justify-center gap-1 rounded-2xl bg-muted font-bold text-sm transition-colors hover:bg-muted/70"
            >
              {t(
                `${labels[period]}ランキングを 200 位まで見る`,
                `See the full ${labels[period].toLowerCase()} ranking`,
              )}
              <ChevronRightIcon className="size-4" />
            </Link>
          </div>
        ) : (
          <p className="py-16 text-center text-muted-foreground text-sm">
            {t(
              "この期間のランキングはまだありません",
              "No rankings for this period yet",
            )}
          </p>
        )
      ) : failedPeriod === period ? (
        <div className="space-y-3 py-12 text-center">
          <p className="text-muted-foreground text-sm">
            {t("読み込みに失敗しました", "Failed to load")}
          </p>
          <Link
            to={rankingsPath}
            className="font-bold text-clear-bright-blue text-sm"
          >
            {t("ランキングのページを開く", "Open the rankings page")}
          </Link>
        </div>
      ) : (
        <HomeRankingSkeleton />
      )}
    </section>
  )
}

function HomeRankingSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="mx-auto grid max-w-3xl grid-cols-3 items-end gap-2.5 md:gap-6">
        <Skeleton className="aspect-[5/6] w-full rounded-2xl" />
        <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
        <Skeleton className="aspect-square w-full rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4 lg:gap-4 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: 並びが変わらない仮の枠
          <Skeleton key={index} className="h-24 rounded-2xl lg:h-72" />
        ))}
      </div>
    </div>
  )
}
