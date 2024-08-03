// Assume this file is located at `routes/rankings/$year/$month/($day).tsx`
import { json, useLoaderData } from "@remix-run/react"
import { createClient } from "~/lib/client"
import { RankingHeader } from "~/routes/($lang)._main.rankings._index/components/ranking-header"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import { workAwardFieldsFragment } from "~/graphql/fragments/work-award-field"
import { RankingWorkList } from "~/routes/($lang)._main.rankings._index/components/ranking-work-list"

export async function loader(params: LoaderFunctionArgs) {
  const client = createClient()

  // 昨日の日付を取得
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const year = params.params.year
    ? Number.parseInt(params.params.year)
    : yesterday.getFullYear()
  const month = params.params.month
    ? Number.parseInt(params.params.month)
    : yesterday.getMonth() + 1
  const day = params.params.day
    ? Number.parseInt(params.params.day)
    : yesterday.getDate()

  const variables = {
    offset: 0,
    limit: 200,
    where: {
      year: year,
      month: month,
      ...(day !== null && { day: day }),
    },
  }

  const workAwardsResp = await client.query({
    query: workAwardsQuery,
    variables: variables,
  })

  return json({
    year,
    month,
    day,
    workAwards: workAwardsResp,
  })
}

/**
 * ランキングの履歴
 */
export default function Rankings() {
  const data = useLoaderData<typeof loader>()

  console.log(data)
  console.log(data.year)

  return (
    <>
      <RankingHeader
        year={data.year}
        month={data.month}
        day={data.day}
        weekIndex={null}
      />
      <RankingWorkList
        year={data.year}
        month={data.month}
        day={data.day}
        awards={data.workAwards.data.workAwards}
        weekIndex={null}
      />
    </>
  )
}

const workAwardsQuery = graphql(
  `query WorkAwards($offset: Int!, $limit: Int!, $where: WorkAwardsWhereInput!) {
    workAwards(offset: $offset, limit: $limit, where: $where) {
      ...WorkAwardFields
    }
  }`,
  [workAwardFieldsFragment],
)
