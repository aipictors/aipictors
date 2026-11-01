import { Link } from "@remix-run/react"
import { ChevronRight, Gift, Trophy } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import {
  getDevLoginUserId,
  getViewerRequestHeaders,
} from "~/lib/viewer-request-headers"

type SupportSummary = {
  cumulativeSentPt: number
  cumulativeReceivedPt: number
  cumulativeSentRank?: number | null
  cumulativeReceivedRank?: number | null
  weeklySentPt: number
  weeklyReceivedPt: number
  weeklySentRank: number | null
  weeklyReceivedRank: number | null
}

export function CoinSupportTab() {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const [summary, setSummary] = useState<SupportSummary | null>(null)
  const [hasError, setHasError] = useState(false)

  const load = async () => {
    const viewerUserId = authContext.userId ?? getDevLoginUserId()
    if (!viewerUserId) return

    try {
      setHasError(false)
      const headers = await getViewerRequestHeaders({
        includeJsonContentType: true,
      })
      const response = await fetch(
        `/api/coins/support/summary/${encodeURIComponent(viewerUserId)}`,
        { headers },
      )
      const json = (await response.json()) as {
        error: string | null
        data: SupportSummary | null
      }

      if (!response.ok || json.error || !json.data) {
        throw new Error(json.error ?? "Failed to load support summary")
      }

      setSummary(json.data)
    } catch {
      setHasError(true)
    }
  }

  useEffect(() => {
    if (authContext.isLoading || authContext.isNotLoggedIn) return
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authContext.isLoading, authContext.isNotLoggedIn, authContext.userId])

  const items = [
    {
      label: t("今週 推した", "Given this week"),
      value: summary?.weeklySentPt,
      rank: summary?.weeklySentRank,
    },
    {
      label: t("今週 推された", "Received this week"),
      value: summary?.weeklyReceivedPt,
      rank: summary?.weeklyReceivedRank,
    },
    {
      label: t("累計 推した", "Given in total"),
      value: summary?.cumulativeSentPt,
      rank: summary?.cumulativeSentRank,
    },
    {
      label: t("累計 推された", "Received in total"),
      value: summary?.cumulativeReceivedPt,
      rank: summary?.cumulativeReceivedRank,
    },
  ]

  const links = [
    {
      to: "/coin-rankings",
      icon: Trophy,
      label: t(
        "推しランキング・貢献度ランキング",
        "Support and contribution rankings",
      ),
    },
    {
      to: "/settings/support-received",
      icon: Gift,
      label: t(
        "推してくれた人・受け取った履歴",
        "Your supporters and received history",
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm leading-6">
        {t(
          "コインでユーザーを推すと pt になります。フリーコインは 1 枚 1pt、プレミアムコインは 1 枚 10pt です。週間の集計は月曜に切り替わります。",
          "Supporting users with coins earns pt: 1pt per free coin and 10pt per premium coin. Weekly totals reset on Monday.",
        )}
      </p>

      {hasError ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
          <span className="text-destructive">
            {t("読み込めませんでした", "Could not load")}
          </span>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            {t("再読み込み", "Retry")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border">
          {items.map((item) => (
            <div key={item.label} className="bg-background p-3 md:p-4">
              <p className="text-muted-foreground text-xs">{item.label}</p>
              {summary ? (
                <>
                  <p className="mt-1 font-bold text-xl tabular-nums md:text-2xl">
                    {(item.value ?? 0).toLocaleString()}
                    <span className="ml-1 font-normal text-muted-foreground text-xs">
                      pt
                    </span>
                  </p>
                  <p className="mt-0.5 text-muted-foreground text-xs tabular-nums">
                    {item.rank
                      ? t(
                          `${item.rank.toLocaleString()} 位`,
                          `Rank ${item.rank.toLocaleString()}`,
                        )
                      : t("順位なし", "Not ranked")}
                  </p>
                </>
              ) : (
                <>
                  <Skeleton className="mt-1.5 h-6 w-16" />
                  <Skeleton className="mt-1.5 h-3 w-10" />
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <ul className="divide-y rounded-lg border">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="flex min-h-12 items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-muted/50"
            >
              <link.icon className="h-5 w-5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">{link.label}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
