import { ChevronLeftIcon, ChevronRightIcon, SproutIcon } from "lucide-react"
import { graphql, type ResultOf } from "gql.tada"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { loaderClient } from "~/lib/loader-client"
import {
  RankingSensitiveWorkList,
  SensitiveWorkAwardListItemFragment,
} from "~/routes/($lang)._main.rankings._index/components/ranking-sensitive-work-list"
import {
  RankingWorkList,
  WorkAwardListItemFragment,
} from "~/routes/($lang)._main.rankings._index/components/ranking-work-list"

/** 登録からこの日数以内か、通常のランキングに入ったことがない人が対象（cron-update-ranking の ROOKIE_DAYS と同じ） */
export const ROOKIE_DAYS = 90

type RookieAwards = ResultOf<typeof rookieWorkAwardsQuery>["rookieWorkAwards"]
type SensitiveRookieAwards = ResultOf<
  typeof sensitiveRookieWorkAwardsQuery
>["rookieWorkAwards"]

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const addDays = (date: string, days: number) => {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

/**
 * ルーキーランキングを読む（?date=YYYY-MM-DD。省くと最新の日）。順位は 1 日 1 回、朝 4 時に変わるだけなので
 * ページは拠点のキャッシュから返す（呼び出し側で Cache-Control を付ける）
 */
export const loadRookieRanking = async (
  request: Request,
  isSensitive: boolean,
) => {
  const param = new URL(request.url).searchParams.get("date")
  const date = param !== null && DATE_PATTERN.test(param) ? param : null
  if (isSensitive) {
    const resp = await loaderClient.query({
      query: sensitiveRookieWorkAwardsQuery,
      variables: { offset: 0, limit: 50, date },
    })
    const awards = resp.data?.rookieWorkAwards ?? []
    return {
      isSensitive,
      date: awards[0]?.dateText ?? date,
      sensitiveAwards: awards,
      awards: [] as RookieAwards,
    }
  }
  const resp = await loaderClient.query({
    query: rookieWorkAwardsQuery,
    variables: { offset: 0, limit: 50, date },
  })
  const awards = resp.data?.rookieWorkAwards ?? []
  return {
    isSensitive,
    date: awards[0]?.dateText ?? date,
    awards,
    sensitiveAwards: [] as SensitiveRookieAwards,
  }
}

type Props = {
  isSensitive: boolean
  date: string | null
  awards: ResultOf<typeof rookieWorkAwardsQuery>["rookieWorkAwards"]
  sensitiveAwards: ResultOf<
    typeof sensitiveRookieWorkAwardsQuery
  >["rookieWorkAwards"]
}

/**
 * ルーキーランキング: 新しいクリエイターと、まだ通常のランキングに入ったことがないクリエイターだけの毎日のランキング
 */
export function RookieRanking(props: Props) {
  const t = useTranslation()
  const basePath = props.isSensitive ? "/r/rankings/rookie" : "/rankings/rookie"
  const rankingsPath = props.isSensitive ? "/r/rankings" : "/rankings"
  const [year, month, day] = (props.date ?? "").split("-").map(Number)
  const count = props.isSensitive
    ? props.sensitiveAwards.length
    : props.awards.length

  return (
    <div className="space-y-6 pb-8">
      <section className="mx-auto max-w-6xl space-y-4 px-3 sm:px-4 lg:px-0">
        <div className="overflow-hidden rounded-[28px] border border-emerald-500/20 bg-gradient-to-br from-emerald-50 via-background to-sky-50 p-5 shadow-sm sm:p-7 dark:from-emerald-950/40 dark:to-sky-950/30">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow">
              <SproutIcon className="size-6" />
            </span>
            <div className="min-w-0 space-y-2">
              <h1 className="font-bold text-2xl tracking-tight sm:text-3xl">
                {props.isSensitive
                  ? t("R18 ルーキーランキング", "R18 Rookie Rankings")
                  : t("ルーキーランキング", "Rookie Rankings")}
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t(
                  `登録から${ROOKIE_DAYS}日以内のクリエイターと、まだランキングに入ったことがないクリエイターの作品だけで競う、毎日のランキングです。前日のいいね数で、1人1作品まで選ばれます。`,
                  `A daily ranking only for creators who joined in the last ${ROOKIE_DAYS} days and creators who have never made the regular rankings. Ranked by the previous day's likes, one work per creator.`,
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {props.date && (
              <Button
                asChild
                variant="outline"
                size="icon"
                className="rounded-full"
              >
                <Link
                  to={`${basePath}?date=${addDays(props.date, -1)}`}
                  aria-label={t("前の日", "Previous day")}
                >
                  <ChevronLeftIcon className="size-4" />
                </Link>
              </Button>
            )}
            <p className="font-bold text-lg">
              {props.date
                ? t(`${year}年${month}月${day}日`, props.date)
                : t("まだ集計がありません", "No ranking yet")}
            </p>
            {props.date && (
              <Button
                asChild
                variant="outline"
                size="icon"
                className="rounded-full"
              >
                <Link
                  to={`${basePath}?date=${addDays(props.date, 1)}`}
                  aria-label={t("次の日", "Next day")}
                >
                  <ChevronRightIcon className="size-4" />
                </Link>
              </Button>
            )}
          </div>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link to={rankingsPath}>
              {t("通常のランキングへ", "Regular rankings")}
            </Link>
          </Button>
        </div>
      </section>

      {count === 0 ? (
        <p className="mx-auto max-w-6xl px-3 py-12 text-center text-muted-foreground text-sm sm:px-4 lg:px-0">
          {t(
            "この日のルーキーランキングはありません",
            "No rookie ranking for this day",
          )}
        </p>
      ) : props.isSensitive ? (
        <RankingSensitiveWorkList
          awards={props.sensitiveAwards}
          year={year ?? 0}
          month={month ?? 0}
          day={day ?? null}
          weekIndex={null}
        />
      ) : (
        <RankingWorkList
          awards={props.awards}
          year={year ?? 0}
          month={month ?? 0}
          day={day ?? null}
          weekIndex={null}
        />
      )}
    </div>
  )
}

const rookieWorkAwardsQuery = graphql(
  `query RookieWorkAwards($offset: Int!, $limit: Int!, $date: String) {
    rookieWorkAwards(offset: $offset, limit: $limit, date: $date) {
      ...WorkAwardListItem
    }
  }`,
  [WorkAwardListItemFragment],
)

const sensitiveRookieWorkAwardsQuery = graphql(
  `query SensitiveRookieWorkAwards($offset: Int!, $limit: Int!, $date: String) {
    rookieWorkAwards(offset: $offset, limit: $limit, date: $date, isSensitive: true) {
      ...SensitiveWorkAwardListItem
    }
  }`,
  [SensitiveWorkAwardListItemFragment],
)
