import { useLoaderData, useSearchParams } from "@remix-run/react"
import { loaderClient } from "~/lib/loader-client"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import {
  RankingSensitiveWorkList,
  SensitiveWorkAwardListItemFragment,
} from "~/routes/($lang)._main.rankings._index/components/ranking-sensitive-work-list"
import { RankingSensitiveUserListModern } from "~/routes/($lang)._main.rankings._index/components/ranking-sensitive-user-list-modern"
import { RankingSensitiveHeader } from "~/routes/($lang)._main.rankings._index/components/ranking-sensitive-header"
import { config } from "~/config"

export async function loader(params: LoaderFunctionArgs) {
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
      isSensitive: true,
    },
  }

  const workAwardsResp = await loaderClient.query({
    query: workAwardsQuery,
    variables: variables,
  })

  return {
    year,
    month,
    day,
    workAwards: workAwardsResp,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

/**
 * ランキングの履歴
 */
export default function Rankings () {
  const data = useLoaderData<typeof loader>()
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

  // デイリーランキングかどうかを判定
  const isDaily = data.day !== null && data.day !== undefined

  return (
    <>
      <RankingSensitiveHeader
        year={data.year}
        month={data.month}
        day={data.day}
        weekIndex={null}
        rankingType={isDaily ? rankingType : undefined}
        onRankingTypeChange={isDaily ? handleRankingTypeChange : undefined}
      />
      {rankingType === "users" && isDaily ? (
        <RankingSensitiveUserListModern
          year={data.year}
          month={data.month}
          day={data.day}
          awards={[]}
          weekIndex={null}
        />
      ) : (
        <RankingSensitiveWorkList
          year={data.year}
          month={data.month}
          day={data.day}
          awards={data.workAwards.data.workAwards}
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
