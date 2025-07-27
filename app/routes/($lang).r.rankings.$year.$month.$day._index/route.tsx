import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData, useParams, useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { RankingSensitiveHeader } from "~/routes/($lang)._main.rankings._index/components/ranking-sensitive-header"
import {
  RankingSensitiveWorkList,
  SensitiveWorkAwardListItemFragment,
} from "~/routes/($lang)._main.rankings._index/components/ranking-sensitive-work-list"
import { RankingSensitiveUserList } from "~/routes/($lang)._main.rankings._index/components/ranking-sensitive-user-list"
import { config, META } from "~/config"
import { createMeta } from "~/utils/create-meta"

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

  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

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

  return {
    workAwards: workAwardsResp.data.workAwards,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function SensitiveAwardsPage() {
  const data = useLoaderData<typeof loader>()
  const params = useParams<"year" | "month" | "day">()
  const [searchParams, setSearchParams] = useSearchParams()

  // URL パラメータから直接状態を取得（useState は使わない）
  const typeParam = searchParams.get("type")
  const rankingType: "works" | "users" =
    typeParam === "users" ? "users" : "works"

  // ランキングタイプが変更された時のハンドラー
  const handleRankingTypeChange = (type: "works" | "users") => {
    // URLパラメータを更新
    const newSearchParams = new URLSearchParams(searchParams)
    if (type === "users") {
      newSearchParams.set("type", "users")
    } else {
      newSearchParams.delete("type")
    }
    setSearchParams(newSearchParams, { replace: true })
  }

  if (
    params.year === undefined ||
    params.month === undefined ||
    params.day === undefined
  ) {
    throw new ParamsError()
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
        rankingType={rankingType}
        onRankingTypeChange={handleRankingTypeChange}
      />
      {rankingType === "users" ? (
        <RankingSensitiveUserList
          year={year}
          month={month}
          day={day}
          awards={[]}
          weekIndex={null}
        />
      ) : (
        <RankingSensitiveWorkList
          year={year}
          month={month}
          day={day}
          awards={data.workAwards}
          weekIndex={null}
        />
      )}
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
