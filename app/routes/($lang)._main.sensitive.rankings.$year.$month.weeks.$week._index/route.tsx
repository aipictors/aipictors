import { createClient } from "~/lib/client"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import {
  RankingSensitiveWorkList,
  SensitiveWorkAwardListItemFragment,
} from "~/routes/($lang)._main.rankings._index/components/ranking-sensitive-work-list"
import { RankingSensitiveHeader } from "~/routes/($lang)._main.rankings._index/components/ranking-sensitive-header"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.year === undefined) {
    throw new Response(null, { status: 404 })
  }

  if (props.params.month === undefined) {
    throw new Response(null, { status: 404 })
  }

  if (props.params.week === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const year = Number.parseInt(props.params.year)

  const month = Number.parseInt(props.params.month)

  const week = Number.parseInt(props.params.week)

  const workAwardsResp = await client.query({
    query: workAwardsQuery,
    variables: {
      offset: 0,
      limit: 200,
      where: {
        year: year,
        month: month,
        weekIndex: week,
        isSensitive: true,
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

export const meta: MetaFunction = () => {
  return createMeta(META.SENSITIVE_RANKINGS_WEEK)
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

  console.log(data.month)

  return (
    <>
      <RankingSensitiveHeader
        year={data.year}
        month={data.month}
        day={null}
        weekIndex={data.weekIndex}
      />
      <RankingSensitiveWorkList
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
      ...SensitiveWorkAwardListItem
    }
  }`,
  [SensitiveWorkAwardListItemFragment],
)
