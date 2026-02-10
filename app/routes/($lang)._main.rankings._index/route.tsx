import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData, useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config, META } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import { RankingHeader } from "~/routes/($lang)._main.rankings._index/components/ranking-header"
import { RankingUserList } from "~/routes/($lang)._main.rankings._index/components/ranking-user-list"
import {
  RankingWorkList,
  WorkAwardListItemFragment,
} from "~/routes/($lang)._main.rankings._index/components/ranking-work-list"
import { createMeta } from "~/utils/create-meta"

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  // 昨日の日付を取得
  const yesterday = new Date()

  yesterday.setDate(yesterday.getDate() - 1)

  const year = props.params.year
    ? Number.parseInt(props.params.year)
    : yesterday.getFullYear()

  console.log(year)

  const month = props.params.month
    ? Number.parseInt(props.params.month)
    : yesterday.getMonth() + 1

  const day = props.params.day
    ? Number.parseInt(props.params.day)
    : yesterday.getDate()

  const variables = {
    offset: 0,
    limit: 200,
    where: {
      year: year,
      month: month,
      day: day,
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
  "Cache-Control": config.cacheControl.oneDay,
})

export const meta: MetaFunction = (props) => {
  return createMeta(META.RANKINGS, undefined, props.params.lang)
}

/**
 * ランキングの履歴
 */
export default function Rankings() {
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
    setSearchParams(newSearchParams, {
      replace: true,
      preventScrollReset: true,
    }) // replace: true で履歴を置き換え
  }

  // デイリーランキングかどうかを判定
  const isDaily = data.day !== null && data.day !== undefined

  console.log("isDaily:", isDaily, "data.day:", data.day)

  return (
    <>
      {data && (
        <>
          <RankingHeader
            year={data.year}
            month={data.month}
            day={data.day}
            weekIndex={null}
            rankingType={isDaily ? rankingType : undefined}
            onRankingTypeChange={isDaily ? handleRankingTypeChange : undefined}
          />
          {rankingType === "users" && isDaily ? (
            <RankingUserList
              year={data.year}
              month={data.month}
              day={data.day}
            />
          ) : (
            <RankingWorkList
              year={data.year}
              month={data.month}
              day={data.day}
              awards={data.workAwards.data.workAwards}
              weekIndex={null}
            />
          )}
        </>
      )}
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
