import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json, useLoaderData, useParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { RankingSensitiveHeader } from "~/routes/($lang)._main.rankings._index/components/ranking-sensitive-header"
import {
  RankingSensitiveWorkList,
  SensitiveWorkAwardListItemFragment,
} from "~/routes/($lang)._main.rankings._index/components/ranking-sensitive-work-list"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"

export const meta: MetaFunction = (props) => {
  return createMeta(META.SENSITIVE_RANKINGS_DAY, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  if (
    props.params.year === undefined ||
    props.params.month === undefined ||
    props.params.day === undefined
  ) {
    throw new Response(null, { status: 404 })
  }

  const redirectResponse = checkLocaleRedirect(props.request)

  if (redirectResponse) {
    return redirectResponse
  }

  const year = Number.parseInt(props.params.year)

  const month = Number.parseInt(props.params.month)

  const day = Number.parseInt(props.params.day)

  const workAwardsResp = await loaderClient.query({
    query: workAwardsQuery,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        year: year,
        month: month,
        day: day,
        isSensitive: true,
      },
    },
  })

  return json({
    workAwards: workAwardsResp.data.workAwards,
  })
}

export default function SensitiveAwardsPage() {
  const data = useLoaderData<typeof loader>()

  const params = useParams<"year" | "month" | "day">()

  if (
    params.year === undefined ||
    params.month === undefined ||
    params.day === undefined
  ) {
    throw ParamsError()
  }

  const year = Number.parseInt(params.year)

  const month = Number.parseInt(params.month)

  const day = Number.parseInt(params.day)

  if (data === null) {
    return null
  }

  return (
    <>
      <RankingSensitiveHeader
        year={year}
        month={month}
        day={day}
        weekIndex={null}
      />
      <RankingSensitiveWorkList
        year={year}
        month={month}
        day={day}
        awards={data.workAwards}
        weekIndex={null}
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
