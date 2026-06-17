import { Link } from "@remix-run/react"
import { Trophy } from "lucide-react"
import { useEffect, useState } from "react"
import {
  FreeSupportCoinIcon,
  PremiumSupportCoinIcon,
} from "~/components/support-coin-icons"
import { SupportRankAvatar } from "~/components/support-rank-avatar"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { useTranslation } from "~/hooks/use-translation"

type SupportRankingItem = {
  rank: number
  userId: string
  coinAmount: number
  ptAmount: number
  freePtAmount: number
  premiumPtAmount: number
  transferCount: number
  isAnonymous?: boolean
  iconUrl?: string | null
  userName?: string | null
  userLogin?: string | null
}

type ApiResponse = {
  error: string | null
  data: {
    kind: "sent"
    weekStartDate: string
    items: SupportRankingItem[]
    totalCount: number
    offset: number
    limit: number
  } | null
}

const formatNumber = (value: number) => value.toLocaleString()
const PREMIUM_COIN_PT_MULTIPLIER = 10
const toPremiumCoinAmount = (row: SupportRankingItem) =>
  Math.max(0, Math.floor(row.premiumPtAmount / PREMIUM_COIN_PT_MULTIPLIER))
const toFreeCoinAmount = (row: SupportRankingItem) => Math.max(0, row.freePtAmount)

export function UserSupportRankingSection(props: {
  targetUserId: string
  targetUserLogin: string
  limit?: number
}) {
  const t = useTranslation()
  const limit = props.limit ?? 5
  const [items, setItems] = useState<SupportRankingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `/api/coins/support/rankings/public?kind=sent&recipientUserId=${encodeURIComponent(props.targetUserId)}&limit=${limit}`,
          { method: "GET" },
        )
        const json = (await response.json()) as ApiResponse
        if (!response.ok || json.error || !json.data) {
          setItems([])
          return
        }
        setItems(json.data.items)
      } catch {
        setItems([])
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [limit, props.targetUserId])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-5 w-5 text-sky-500" />
              <span>
                {t(
                  "このユーザーへの貢献度ランキング",
                  "Contribution ranking for this user",
                )}
              </span>
            </CardTitle>
            <p className="mt-1 text-muted-foreground text-sm">
              {t(
                "フリーコイン 1pt / プレミアムコイン 10pt で換算した累計ランキングです。",
                "Cumulative ranking calculated as 1pt per free coin and 10pt per premium coin.",
              )}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          [0, 1, 2].map((index) => (
            <div key={index} className="flex items-center gap-3 rounded-lg border px-3 py-2 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
              </div>
              <div className="h-4 w-16 rounded bg-muted" />
            </div>
          ))
        ) : items.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t(
              "まだこのユーザーへの貢献データはありません。",
              "No contribution data for this user yet.",
            )}
          </p>
        ) : (
          items.map((row) => (
            <div
              key={`${row.rank}-${row.userId}`}
              className="flex items-center gap-3 rounded-lg border px-3 py-2"
            >
              <SupportRankAvatar
                rank={row.rank}
                iconUrl={row.iconUrl}
                name={row.userName ?? row.userLogin ?? row.userId}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                {row.isAnonymous || !row.userLogin ? (
                  <p className="truncate font-semibold text-sm">
                    {row.userName || t("匿名", "Anonymous")}
                  </p>
                ) : (
                  <Link
                    to={`/users/${row.userLogin}`}
                    className="truncate font-semibold text-sm transition-opacity hover:opacity-70"
                  >
                    {row.userName || row.userLogin}
                  </Link>
                )}
              </div>
              <div className="shrink-0 text-right space-y-1 text-[11px]">
                <p className="text-muted-foreground">{t("累計pt", "Cumulative pt")}</p>
                <p className="font-bold text-sm">{formatNumber(row.ptAmount)}</p>
                <div className="flex items-center justify-end gap-1 text-amber-700 dark:text-amber-400">
                  <PremiumSupportCoinIcon className="h-4 w-4" />
                  <span>{t(`${formatNumber(toPremiumCoinAmount(row))}コイン`, `${formatNumber(toPremiumCoinAmount(row))} coins`)}</span>
                </div>
                <div className="flex items-center justify-end gap-1 text-muted-foreground">
                  <FreeSupportCoinIcon className="h-4 w-4" />
                  <span>{t(`${formatNumber(toFreeCoinAmount(row))}コイン`, `${formatNumber(toFreeCoinAmount(row))} coins`)}</span>
                </div>
              </div>
            </div>
          ))
        )}

        <Button asChild variant="ghost" size="sm" className="mt-1 w-full text-muted-foreground text-sm">
          <Link to={`/users/${props.targetUserLogin}/supports`}>
            {t("もっと見る", "See more")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}