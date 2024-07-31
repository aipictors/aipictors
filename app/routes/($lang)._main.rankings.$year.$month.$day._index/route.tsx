import { workAwardFieldsFragment } from "~/graphql/fragments/work-award-field"
import { createClient } from "~/lib/client"
import { RankingHeader } from "~/routes/($lang)._main.rankings._index/components/ranking-header"
import { RankingWorkList } from "~/routes/($lang)._main.rankings._index/components/ranking-work-list"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.year === undefined) {
    throw new Response(null, { status: 404 })
  }

  if (props.params.month === undefined) {
    throw new Response(null, { status: 404 })
  }

  if (props.params.day === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const year = Number.parseInt(props.params.year)

  const month = Number.parseInt(props.params.month)

  const day = Number.parseInt(props.params.day)

  const workAwardsResp = await client.query({
    query: workAwardsQuery,
    variables: {
      offset: 0,
      limit: 200,
      where: {
        year: year,
        month: month,
        day: day,
      },
    },
  })

  return json({
    year,
    month,
    day,
    workAwards: workAwardsResp,
  })
}

/**
 * ある日のランキングの履歴
 */
export default function DayAwards() {
  const params = useParams()

  if (params.year === undefined) {
    return null
  }

  if (params.month === undefined) {
    return null
  }

  if (params.day === undefined) {
    return null
  }

  const data = useLoaderData<typeof loader>()

  return (
    <>
      <RankingHeader year={data.year} month={data.month} day={data.day} />
      <RankingWorkList
        year={data.year}
        month={data.month}
        day={data.day}
        awards={data.workAwards.data.workAwards}
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
