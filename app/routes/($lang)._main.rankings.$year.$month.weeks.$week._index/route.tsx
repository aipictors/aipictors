import { loaderClient } from "~/lib/loader-client"
import { RankingHeader } from "~/routes/($lang)._main.rankings._index/components/ranking-header"
import {
  RankingWorkList,
  WorkAwardListItemFragment,
} from "~/routes/($lang)._main.rankings._index/components/ranking-work-list"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"

export async function loader(props: LoaderFunctionArgs) {
  const redirectResponse = checkLocaleRedirect(props.request)

  if (redirectResponse) {
    return redirectResponse
  }

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

  const workAwardsResp = await loaderClient.query({
    query: workAwardsQuery,
    variables: {
      offset: 0,
      limit: 200,
      where: {
        year: year,
        month: month,
        weekIndex: week,
      },
    },
  })

  return json({
    year,
    month,
    weekIndex: week,
    workAwards: workAwardsResp,
  })
}

export const meta: MetaFunction = (props) => {
  return createMeta(META.RANKINGS_WEEK, undefined, props.params.lang)
}

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
