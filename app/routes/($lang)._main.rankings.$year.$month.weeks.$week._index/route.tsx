import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { redirect } from "@remix-run/cloudflare"
import { useLoaderData, useParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config, META } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import { RankingHeader } from "~/routes/($lang)._main.rankings._index/components/ranking-header"
import {
  RankingWorkList,
  WorkAwardListItemFragment,
} from "~/routes/($lang)._main.rankings._index/components/ranking-work-list"
import { createMeta } from "~/utils/create-meta"
import { getPreviousWeeklyPeriod } from "~/utils/get-weeks-in-month"
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

  if (props.params.week === undefined) {
    throw new Response(null, { status: 404 })
  }

  const year = Number.parseInt(props.params.year)

  const month = Number.parseInt(props.params.month)

  const week = Number.parseInt(props.params.week)

  const redirectPath = getFutureRankingRedirectPath(props.request.url, {
    kind: "weekly",
    year,
    month,
    week,
    pathnamePrefix: "/rankings",
  })

  if (redirectPath) {
    return redirect(redirectPath, { status: 302 })
  }

  let targetYear = year
  let targetMonth = month
  let targetWeek = week
  let workAwardsResp

  for (let attempt = 0; attempt < 8; attempt += 1) {
    workAwardsResp = await loaderClient.query({
      query: workAwardsQuery,
      variables: {
        offset: 0,
        limit: 200,
        where: {
          year: targetYear,
          month: targetMonth,
          weekIndex: targetWeek,
        },
      },
    })

    if (workAwardsResp.data.workAwards.length > 0) {
      if (targetYear !== year || targetMonth !== month || targetWeek !== week) {
        const url = new URL(props.request.url)
        url.pathname = `/rankings/${targetYear}/${targetMonth}/weeks/${targetWeek}`
        return redirect(`${url.pathname}${url.search}`, { status: 302 })
      }
      break
    }

    const previousPeriod = getPreviousWeeklyPeriod(
      targetYear,
      targetMonth,
      targetWeek,
    )

    targetYear = previousPeriod.year
    targetMonth = previousPeriod.month
    targetWeek = previousPeriod.weekIndex
  }

  return {
    year: targetYear,
    month: targetMonth,
    weekIndex: targetWeek,
    workAwards: workAwardsResp,
  }
}

export const meta: MetaFunction = (props) => {
  return createMeta(META.RANKINGS_WEEK, undefined, props.params.lang)
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

/**
 * ある月のランキングの履歴
 */
export default function MonthlyAwards() {
  const params = useParams()

  if (params.year === undefined) {
    return null
  }

  if (params.month === undefined) {
    return null
  }

  const data = useLoaderData<typeof loader>()

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
          weekIndex={data.weekIndex}
        />
        <RankingWorkList
          year={data.year}
          month={data.month}
          day={null}
          weekIndex={data.weekIndex}
          awards={data.workAwards.data.workAwards}
        />
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

