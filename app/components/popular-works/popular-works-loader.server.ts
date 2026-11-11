import { graphql, type ResultOf } from "gql.tada"
import { config } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import {
  PopularWorksQuery,
  sortPopularWorks,
} from "~/components/popular-works/popular-works-query"
import {
  parsePopularWorksDate,
  shiftDateString,
  toJstDateString,
} from "~/utils/popular-works-date"

type PopularWork = ResultOf<typeof PopularWorksQuery>["popularWorks"][number]

/**
 * 人気作品のページのデータ
 * 全年齢は作品も返す。R18 はログインしていないと API が返さないので、日付だけ決めて作品は画面側で読む
 * @param props
 */
export async function loadPopularWorks(props: {
  request: Request
  isSensitive: boolean
}) {
  const url = new URL(props.request.url)
  const today = toJstDateString(new Date())
  const requestedDate = parsePopularWorksDate(
    url.searchParams.get("date"),
    today,
  )
  const yesterday = shiftDateString(today, -1)

  // 日付の指定がなければ今日の分、まだ選ばれていなければ（お昼より前）昨日の分
  const candidates =
    requestedDate !== null ? [requestedDate] : [today, yesterday]

  let date = candidates[0]
  let works: PopularWork[] = []

  for (const candidate of candidates) {
    date = candidate
    if (props.isSensitive) {
      if (await hasPopularWorks(candidate)) break
      continue
    }
    works = await fetchAllAgesWorks(candidate)
    if (works.length > 0) break
  }

  // 過去の日の一覧は変わらない。今日・昨日の分はお昼に入れ替わるので短めにする
  const cacheControl =
    date < yesterday ? config.cacheControl.oneDay : config.cacheControl.oneHour

  return {
    data: {
      date,
      today,
      isLatest: requestedDate === null,
      works: sortPopularWorks(works),
    },
    cacheControl,
  }
}

async function fetchAllAgesWorks(date: string): Promise<PopularWork[]> {
  const resp = await loaderClient.query({
    query: PopularWorksQuery,
    variables: { where: { date, isSensitive: false } },
  })
  return resp.data.popularWorks
}

/**
 * その日の集計があるか（R18 の一覧の日付を決める。全年齢と R18 は同じ処理で選ばれる）
 * @param date
 */
async function hasPopularWorks(date: string): Promise<boolean> {
  const resp = await loaderClient.query({
    query: PopularWorkIdsQuery,
    variables: { where: { date, isSensitive: false } },
  })
  return resp.data.popularWorks.length > 0
}

const PopularWorkIdsQuery = graphql(
  `query PopularWorkIds($where: PopularWorksWhereInput!) {
    popularWorks(where: $where) {
      id
    }
  }`,
)
