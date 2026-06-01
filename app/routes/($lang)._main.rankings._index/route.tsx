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
        <div className="space-y-6 pb-8">
          <RankingHeader
            year={data.year}
            month={data.month}
            day={data.day}
            weekIndex={null}
            rankingType={isDaily ? rankingType : undefined}
            onRankingTypeChange={isDaily ? handleRankingTypeChange : undefined}
          />
          <section className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-0">
            <div className="rounded-[28px] border border-border/40 bg-linear-to-br from-white via-slate-50 to-orange-50 px-5 py-5 shadow-sm dark:from-zinc-950 dark:via-zinc-950 dark:to-orange-950/30">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <p className="font-semibold text-lg text-foreground">
                    {rankingType === "users"
                      ? "ユーザーランキング"
                      : "作品ランキング"}
                  </p>
                  <p className="max-w-3xl text-muted-foreground text-sm leading-6">
                    {rankingType === "users"
                      ? "デイリー単位で、期間中に最も反応を集めた投稿をもとにユーザー順位を確認できます。"
                      : "前日分を基準にしたランキングを見やすいカードで一覧表示しています。上部の切り替えから AIランキングや週次・月次表示にも移動できます。"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">
                    日次 / 週次 / 月次
                  </span>
                  <span className="rounded-full bg-amber-100 px-3 py-1.5 font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-200">
                    AIランキング切替対応
                  </span>
                </div>
              </div>
            </div>
          </section>
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
        </div>
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
