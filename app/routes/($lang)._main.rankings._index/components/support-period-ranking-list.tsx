import { Trophy } from "lucide-react"
import { SupportRankAvatar } from "~/components/support-rank-avatar"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import type { SupportPeriodRankingData } from "~/lib/server/support-rankings.server"

const formatNumber = (value: number) => value.toLocaleString()

type ColumnProps = {
  title: string
  colorClass: string
  emptyText: string
  data: SupportPeriodRankingData | null
}

function RankingColumn(props: ColumnProps) {
  const items = props.data?.items ?? []

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className={`text-lg ${props.colorClass}`}>
          {props.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground text-sm">
            {props.emptyText}
          </p>
        ) : (
          <div className="space-y-2">
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              {items.slice(0, 3).map((row) => (
                <div
                  key={`${props.title}-${row.rank}-${row.userId}`}
                  className="flex flex-col items-center gap-2 rounded-xl border bg-muted/30 p-4 text-center"
                >
                  <SupportRankAvatar
                    rank={row.rank}
                    iconUrl={row.iconUrl}
                    name={row.userName}
                    size="lg"
                  />
                  <p className="mt-1 truncate font-semibold text-sm">
                    {row.userName || row.userId}
                  </p>
                  <p className={`font-bold text-xl ${props.colorClass}`}>
                    {formatNumber(row.ptAmount)} pt
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatNumber(row.coinAmount)} coins · {formatNumber(row.transferCount)} transfers
                  </p>
                </div>
              ))}
            </div>

            {items.slice(3).map((row) => (
              <div
                key={`${props.title}-${row.rank}-${row.userId}`}
                className="flex items-center gap-3 rounded-lg border px-3 py-2"
              >
                <SupportRankAvatar
                  rank={row.rank}
                  iconUrl={row.iconUrl}
                  name={row.userName}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-sm">
                    {row.userName || row.userId}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatNumber(row.coinAmount)} coins · {formatNumber(row.transferCount)} transfers
                  </p>
                </div>
                <p className={`shrink-0 font-bold text-sm ${props.colorClass}`}>
                  {formatNumber(row.ptAmount)} pt
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function SupportPeriodRankingList(props: {
  receivedRanking: SupportPeriodRankingData | null
  sentRanking: SupportPeriodRankingData | null
  periodLabel: string
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200/40 bg-gradient-to-br from-amber-50/80 via-background to-sky-50/80 p-4 dark:border-amber-900/40 dark:from-amber-950/20 dark:to-sky-950/20">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-amber-500/10 p-2 text-amber-500">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">推し・貢献度ランキング</h3>
            <p className="mt-1 text-muted-foreground text-sm">
              フリーコイン 1pt / プレミアムコイン 10pt で換算した {props.periodLabel} の集計です。
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RankingColumn
          title="推しランキング"
          colorClass="text-amber-500"
          emptyText="この期間の推しランキングはまだありません。"
          data={props.receivedRanking}
        />
        <RankingColumn
          title="貢献度ランキング"
          colorClass="text-sky-500"
          emptyText="この期間の貢献度ランキングはまだありません。"
          data={props.sentRanking}
        />
      </div>
    </div>
  )
}