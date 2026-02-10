import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData, useParams, useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config, META } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import { RankingHeader } from "~/routes/($lang)._main.rankings._index/components/ranking-header"
import {
  RankingWorkList,
  WorkAwardListItemFragment,
} from "~/routes/($lang)._main.rankings._index/components/ranking-work-list"
import { createMeta } from "~/utils/create-meta"
import { RankingUserList } from "./components/ranking-user-list"

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

  if (props.params.day === undefined) {
    throw new Response(null, { status: 404 })
  }

  const year = Number.parseInt(props.params.year)

  const month = Number.parseInt(props.params.month)

  const day = Number.parseInt(props.params.day)

  const workAwardsResp = await loaderClient.query({
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
  return createMeta(META.RANKINGS_DAY, undefined, props.params.lang)
}

/**
 * ある日のランキングの履歴
 */
export default function DayAwards() {
  const params = useParams()
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

  if (params.year === undefined) {
    return null
  }

  if (params.month === undefined) {
    return null
  }

  if (params.day === undefined) {
    return null
  }

  if (data === null) {
    return null
  }

  return (
    <>
      <RankingHeader
        year={data.year}
        month={data.month}
        day={data.day}
        weekIndex={null}
        rankingType={rankingType}
        onRankingTypeChange={handleRankingTypeChange}
      />
      {rankingType === "users" ? (
        <RankingUserList year={data.year} month={data.month} day={data.day} />
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
