import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { redirect } from "@remix-run/cloudflare"
import { useLoaderData, useParams, useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config, META } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import { fetchSupportPeriodRanking } from "~/lib/server/support-rankings.server"
import { RankingHeader } from "~/routes/($lang)._main.rankings._index/components/ranking-header"
import {
  RankingWorkList,
  WorkAwardListItemFragment,
} from "~/routes/($lang)._main.rankings._index/components/ranking-work-list"
import { SupportPeriodRankingList } from "~/routes/($lang)._main.rankings._index/components/support-period-ranking-list"
import { createMeta } from "~/utils/create-meta"
import { getFutureRankingRedirectPath } from "~/utils/rankings/future-ranking-redirect"

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  if (props.params.year === undefined) {
    throw new Response(null, { status: 404 })
  }

  if (props.params.month === undefined) {
    throw new Response(null, { status: 404 })
  }

  const year = Number.parseInt(props.params.year)

  const month = Number.parseInt(props.params.month)
  const rankingFamily =
    new URL(props.request.url).searchParams.get("family") === "support"
      ? "support"
      : "standard"

  const redirectPath = getFutureRankingRedirectPath(props.request.url, {
    kind: "monthly",
    year,
    month,
    pathnamePrefix: "/rankings",
  })

  if (redirectPath) {
    return redirect(redirectPath, { status: 302 })
  }

  if (rankingFamily === "support") {
    const periodKey = `${year}-${String(month).padStart(2, "0")}`
    const [supportReceived, supportSent] = await Promise.all([
      fetchSupportPeriodRanking({
        context: props.context,
        kind: "received",
        period: "monthly",
        periodKey,
        limit: 100,
      }).catch(() => null),
      fetchSupportPeriodRanking({
        context: props.context,
        kind: "sent",
        period: "monthly",
        periodKey,
        limit: 100,
      }).catch(() => null),
    ])

    return {
      rankingFamily,
      year,
      month,
      workAwards: null,
      supportReceived,
      supportSent,
    }
  }

  const workAwardsResp = await loaderClient.query({
    query: workAwardsQuery,
    variables: {
      offset: 0,
      limit: 200,
      where: {
        year,
        month,
      },
    },
  })

  return {
    rankingFamily,
    year,
    month,
    workAwards: workAwardsResp,
    supportReceived: null,
    supportSent: null,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export const meta: MetaFunction = (props) => {
  return createMeta(META.RANKINGS_MONTHLY, undefined, props.params.lang)
}

/**
 * ある月のランキングの履歴
 */
export default function MonthlyAwards() {
  const params = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  if (params.year === undefined) {
    return null
  }

  if (params.month === undefined) {
    return null
  }

  const data = useLoaderData<typeof loader>()
  const rankingFamily: "standard" | "support" =
    data.rankingFamily === "support" ? "support" : "standard"

  if (data === null) {
    return null
  }

  return (
    <>
      <div className="space-y-6 pb-8">
        <RankingHeader
          year={data.year}
          month={data.month}
          day={null}
          weekIndex={null}
          rankingFamily={rankingFamily}
          onRankingFamilyChange={(family) => {
            const newSearchParams = new URLSearchParams(searchParams)
            if (family === "support") {
              newSearchParams.set("family", "support")
            } else {
              newSearchParams.delete("family")
            }
            setSearchParams(newSearchParams, {
              replace: true,
              preventScrollReset: true,
            })
          }}
        />
        {rankingFamily === "support" ? (
          <SupportPeriodRankingList
            receivedRanking={data.supportReceived}
            sentRanking={data.supportSent}
            periodLabel="月間"
          />
        ) : (
          <RankingWorkList
            year={data.year}
            month={data.month}
            day={null}
            weekIndex={null}
            awards={data.workAwards.data.workAwards}
          />
        )}
      </div>
    </>
  )
}

const workAwardsQuery = graphql(
  `query WorkAwards($offset: Int!, $limit: Int!, $where: WorkAwardsWhereInput!) {
    workAwards(offset: $offset, limit: $limit, where: $where) {
      ...WorkAwardListItem
    }
  }`,
  [WorkAwardListItemFragment],
)

