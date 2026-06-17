import { json } from "@remix-run/cloudflare"
import { Link, useLoaderData, useParams } from "@remix-run/react"
import { Trophy } from "lucide-react"
import {
  FreeSupportCoinIcon,
  PremiumSupportCoinIcon,
} from "~/components/support-coin-icons"
import { SupportRankAvatar } from "~/components/support-rank-avatar"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { getServerEnvValue } from "~/lib/server/env.server"
import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import { enrichSupportRankingItems } from "~/lib/server/support-ranking-enrichment.server"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import { config } from "~/config"
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

const PREMIUM_COIN_PT_MULTIPLIER = 10

function CoinBreakdown(props: {
  ptAmount: number
  freePtAmount: number
  premiumPtAmount: number
  align?: "left" | "right"
}) {
  const t = useTranslation()
  const premiumCoinAmount = Math.max(
    0,
    Math.floor(props.premiumPtAmount / PREMIUM_COIN_PT_MULTIPLIER),
  )
  const freeCoinAmount = Math.max(0, props.freePtAmount)

  return (
    <div
      className={`space-y-1 text-[11px] ${
        props.align === "right" ? "text-right" : "text-left"
      }`}
    >
      <p className="text-muted-foreground">{t("累計pt", "Cumulative pt")}</p>
      <p className="font-bold text-base">{props.ptAmount.toLocaleString()}</p>
      <div
        className={`flex items-center gap-1 text-amber-700 dark:text-amber-400 ${
          props.align === "right" ? "justify-end" : "justify-start"
        }`}
      >
        <PremiumSupportCoinIcon className="h-4 w-4" />
        <span>
          {t(
            `${premiumCoinAmount.toLocaleString()}コイン`,
            `${premiumCoinAmount.toLocaleString()} coins`,
          )}
        </span>
      </div>
      <div
        className={`flex items-center gap-1 text-muted-foreground ${
          props.align === "right" ? "justify-end" : "justify-start"
        }`}
      >
        <FreeSupportCoinIcon className="h-4 w-4" />
        <span>
          {t(
            `${freeCoinAmount.toLocaleString()}コイン`,
            `${freeCoinAmount.toLocaleString()} coins`,
          )}
        </span>
      </div>
    </div>
  )
}

type RankingData = {
  kind: "sent"
  weekStartDate: string
  items: SupportRankingItem[]
  totalCount: number
  offset: number
  limit: number
}

const fetchUserSupportRanking = async (context: unknown, userId: string) => {
  const apiBaseUrl =
    getServerEnvValue(context, "AIPICTORS_API_BASE_URL") ??
    "https://backend.aipictors.com"
  const internalToken =
    getServerEnvValue(context, "AIPICTORS_API_INTERNAL_TOKEN") ??
    getServerEnvValue(context, "INTERNAL_API_TOKEN")

  if (!internalToken) return null

  const response = await fetch(
    `${apiBaseUrl}/internal/coins/support/rankings?kind=sent&recipientUserId=${encodeURIComponent(userId)}&limit=100`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${internalToken}`,
        "Content-Type": "application/json",
      },
    },
  )

  if (!response.ok) return null

  const json = (await response.json()) as {
    error: string | null
    data?: RankingData
  }

  if (!json.data) {
    return null
  }

  return {
    ...json.data,
    items: await enrichSupportRankingItems(json.data.items ?? []),
  }
}

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.user === undefined) {
    throw new Response(null, { status: 404 })
  }

  const userResp = await loaderClient.query({
    query: userQuery,
    variables: {
      userId: props.params.user,
    },
  })

  if (userResp.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  const ranking = await fetchUserSupportRanking(
    props.context,
    userResp.data.user.id,
  ).catch(() => null)

  return json({
    user: userResp.data.user,
    ranking,
  })
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function UserSupports () {
  const t = useTranslation()
  const params = useParams()

  if (params.user === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  const ranking = data.ranking
  const items = ranking?.items ?? []

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5 text-sky-500" />
                <span>
                  {t(
                    `${data.user.name} への貢献度ランキング`,
                    `Contribution ranking for ${data.user.name}`,
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
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={`/users/${params.user}`}>{t("プロフィールへ戻る", "Back to profile")}</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
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
                  className="flex items-center gap-3 rounded-xl border px-4 py-3"
                >
                <SupportRankAvatar
                  rank={row.rank}
                  iconUrl={row.iconUrl}
                  name={row.userName ?? row.userLogin ?? row.userId}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                    {row.isAnonymous || !row.userLogin ? (
                      <p className="truncate font-semibold">
                        {row.userName || t("匿名", "Anonymous")}
                      </p>
                    ) : (
                      <>
                        <Link
                          to={`/users/${row.userLogin}`}
                          className="truncate font-semibold transition-opacity hover:opacity-70"
                        >
                          {row.userName || row.userLogin}
                        </Link>
                        <p className="text-muted-foreground text-xs">
                          @{row.userLogin}
                        </p>
                      </>
                    )}
                  <p className="text-muted-foreground text-sm">
                    {row.coinAmount.toLocaleString()} coin / {row.transferCount}
                    {t(" 回の支援", " transfers")}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <CoinBreakdown
                    ptAmount={row.ptAmount}
                    freePtAmount={row.freePtAmount}
                    premiumPtAmount={row.premiumPtAmount}
                    align="right"
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const userQuery = graphql(
  `query User(
    $userId: ID!,
  ) {
    user(id: $userId) {
      id
      name
      iconUrl
    }
  }`,
)
