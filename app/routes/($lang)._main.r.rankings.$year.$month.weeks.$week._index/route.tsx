import { loaderClient } from "~/lib/loader-client"
import type { HeadersFunction, LoaderFunctionArgs, MetaFunction } from "react-router";
import { useParams } from "react-router";
import { useLoaderData } from "react-router";
import { graphql } from "gql.tada"
import {
  RankingSensitiveWorkList,
  SensitiveWorkAwardListItemFragment,
} from "~/routes/($lang)._main.rankings._index/components/ranking-sensitive-work-list"
import { RankingSensitiveHeader } from "~/routes/($lang)._main.rankings._index/components/ranking-sensitive-header"
import { config, META } from "~/config"
import { createMeta } from "~/utils/create-meta"

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

  const workAwardsResp = await loaderClient.query({
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

  return {
    year,
    month,
    weekIndex: week,
    workAwards: workAwardsResp,
  }
}

export const meta: MetaFunction = (props) => {
  return createMeta(META.SENSITIVE_RANKINGS_WEEK, undefined, props.params.lang)
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
