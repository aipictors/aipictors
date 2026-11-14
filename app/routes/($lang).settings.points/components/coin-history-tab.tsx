import { Loader2, RefreshCw } from "lucide-react"
import { Link } from "~/lib/app/locale-router"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { CoinIcon } from "~/components/coin-icon"
import { PremiumCoinIcon } from "~/components/premium-coin-icon"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import {
  formatJstTime,
  formatLedgerDay,
  getTodayLedgerStats,
  groupLedgerByDay,
  type LedgerFilter,
  type LedgerItem,
  matchesLedgerFilter,
} from "~/routes/($lang).settings.points/utils/coin-ledger"

/** /api/coins/summary の履歴 1 回分の件数（API の既定と同じ） */
export const LEDGER_PAGE_SIZE = 100

const VISIBLE_DAYS_STEP = 7

type Props = {
  /** 残高と一緒に取った最新の履歴。読み込み前は null */
  ledger: LedgerItem[] | null
  isLoading: boolean
  onRefresh: () => void
  normalizeLedger: (rows: unknown) => LedgerItem[]
}

export function CoinHistoryTab(props: Props) {
  const t = useTranslation()
  const [filter, setFilter] = useState<LedgerFilter>("all")
  const [olderRows, setOlderRows] = useState<LedgerItem[]>([])
  const [visibleDays, setVisibleDays] = useState(VISIBLE_DAYS_STEP)
  const [hasMoreRows, setHasMoreRows] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const firstPage = props.ledger

  // 履歴を取り直したら、続きの読み込みも最初からにする
  useEffect(() => {
    setOlderRows([])
    setVisibleDays(VISIBLE_DAYS_STEP)
    setHasMoreRows((firstPage?.length ?? 0) >= LEDGER_PAGE_SIZE)
  }, [firstPage])

  const nowSeconds = Math.floor(Date.now() / 1000)

  const rows = useMemo(() => {
    const seen = new Set<number>()
    return [...(firstPage ?? []), ...olderRows]
      .filter((row) => {
        if (seen.has(row.id)) return false
        seen.add(row.id)
        return true
      })
      .sort((a, b) => b.createdAt - a.createdAt || b.id - a.id)
  }, [firstPage, olderRows])

  const days = useMemo(
    () =>
      groupLedgerByDay(
        rows.filter((row) => matchesLedgerFilter(row, filter)),
        t,
      ),
    [rows, filter, t],
  )

  const stats = getTodayLedgerStats(rows, nowSeconds)
  const visible = days.slice(0, visibleDays)
  const hasHiddenDays = days.length > visibleDays

  const loadMore = async () => {
    if (hasHiddenDays) {
      setVisibleDays((value) => value + VISIBLE_DAYS_STEP)
      return
    }

    try {
      setIsLoadingMore(true)
      const headers = await getViewerRequestHeaders({
        includeJsonContentType: true,
      })
      const offset = (firstPage?.length ?? 0) + olderRows.length
      const response = await fetch(
        `/api/coins/summary?includeLedger=1&includeLedgerLimit=${LEDGER_PAGE_SIZE}&includeLedgerOffset=${offset}`,
        { headers },
      )
      const json = (await response.json()) as {
        error: string | null
        data?: { ledger?: unknown }
      }

      if (!response.ok || json.error) {
        throw new Error(json.error ?? "Failed to load history")
      }

      const nextRows = props.normalizeLedger(json.data?.ledger)
      setOlderRows((current) => [...current, ...nextRows])
      setHasMoreRows(nextRows.length >= LEDGER_PAGE_SIZE)
      setVisibleDays((value) => value + VISIBLE_DAYS_STEP)
    } catch {
      toast.error(t("履歴を読み込めませんでした", "Could not load history"))
    } finally {
      setIsLoadingMore(false)
    }
  }

  const filters: { value: LedgerFilter; label: string }[] = [
    { value: "all", label: t("すべて", "All") },
    { value: "received", label: t("もらった", "Received") },
    { value: "used", label: t("使った", "Used") },
    { value: "expired", label: t("失効", "Expired") },
  ]

  const todayItems = [
    { label: t("もらった", "Received"), value: stats.received },
    { label: t("使った", "Used"), value: stats.used },
    { label: t("失効", "Expired"), value: stats.expired },
  ]

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 font-medium text-muted-foreground text-xs">
          {t("今日のコイン", "Today")}
        </p>
        <div className="grid grid-cols-3 divide-x rounded-lg border">
          {todayItems.map((item) => (
            <div key={item.label} className="px-3 py-2.5 text-center">
              <p className="text-muted-foreground text-xs">{item.label}</p>
              {firstPage ? (
                <p className="mt-0.5 font-semibold text-lg tabular-nums">
                  {item.value.toLocaleString()}
                </p>
              ) : (
                <Skeleton className="mx-auto mt-1.5 h-5 w-10" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div
          className="flex min-w-0 gap-1 overflow-x-auto"
          role="group"
          aria-label={t("履歴の絞り込み", "Filter history")}
        >
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={filter === item.value}
              onClick={() => {
                setFilter(item.value)
                setVisibleDays(VISIBLE_DAYS_STEP)
              }}
              className={cn(
                "h-9 shrink-0 rounded-full px-3.5 text-sm transition-colors",
                filter === item.value
                  ? "bg-foreground font-medium text-background"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={props.onRefresh}
          disabled={props.isLoading}
          aria-label={t("履歴を更新", "Refresh history")}
        >
          <RefreshCw
            className={cn("h-4 w-4", props.isLoading && "animate-spin")}
          />
        </Button>
      </div>

      {!firstPage ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
        </div>
      ) : visible.length === 0 ? (
        <p className="rounded-lg border border-dashed py-10 text-center text-muted-foreground text-sm">
          {filter === "all"
            ? t("まだ履歴はありません", "No history yet")
            : t("該当する履歴はありません", "Nothing to show")}
        </p>
      ) : (
        <div className="space-y-4">
          {visible.map((day) => (
            <section key={day.dateKey}>
              <h3 className="mb-1.5 font-medium text-muted-foreground text-xs">
                {formatLedgerDay(day.at, nowSeconds, t)}
              </h3>
              <ul className="divide-y rounded-lg border">
                {day.groups.map((group) => (
                  <li
                    key={group.key}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
                    {group.coinType === "PREMIUM" ? (
                      <PremiumCoinIcon className="h-5 w-5 shrink-0" />
                    ) : (
                      <CoinIcon className="h-5 w-5 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm leading-5">
                        {group.href ? (
                          <Link
                            to={group.href}
                            className="underline-offset-2 hover:underline"
                          >
                            {group.label}
                          </Link>
                        ) : (
                          group.label
                        )}
                        {group.count > 1 && (
                          <span className="ml-1.5 text-muted-foreground text-xs">
                            ×{group.count}
                          </span>
                        )}
                      </p>
                      <p className="text-muted-foreground text-xs tabular-nums">
                        {group.count > 1
                          ? `${formatJstTime(group.firstAt)} 〜 ${formatJstTime(group.lastAt)}`
                          : formatJstTime(group.lastAt)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 font-semibold text-sm tabular-nums",
                        group.delta > 0 &&
                          "text-emerald-600 dark:text-emerald-400",
                        group.kind === "EXPIRE" &&
                          "font-normal text-muted-foreground",
                      )}
                    >
                      {group.delta > 0 ? "+" : group.delta < 0 ? "−" : ""}
                      {Math.abs(group.delta).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {firstPage && (hasHiddenDays || hasMoreRows) && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => void loadMore()}
          disabled={isLoadingMore}
        >
          {isLoadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("もっと見る", "Show more")}
        </Button>
      )}
    </div>
  )
}
