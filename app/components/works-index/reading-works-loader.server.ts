import { graphql } from "gql.tada"
import {
  READING_CONFIGS,
  type ReadingKind,
  type ReadingSort,
} from "~/components/works-index/reading-works-config"
import {
  ReadingWorkFragment,
  type ReadingWork,
} from "~/components/works-index/reading-work-card"
import {
  parseWorksIndexPage,
  toLastPage,
  toWorkExcerpt,
  WORKS_INDEX_PER_PAGE,
} from "~/components/works-index/works-index-params"
import { loaderClient } from "~/lib/loader-client"

const DAY_MS = 24 * 60 * 60 * 1000

/** 検索語の長さの上限（API に長い文を渡さない） */
const QUERY_MAX_LENGTH = 50

const JST_DATE_FORMAT = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "numeric",
  day: "numeric",
})

const parseSort = (value: string | null, fallback: ReadingSort): ReadingSort =>
  value === "new" || value === "popular" ? value : fallback

/**
 * 読みもの（小説・コラム）の一覧のデータ
 * 全年齢の一覧は全年齢の作品だけ、R18 の一覧（/r/novels・/r/notes）は R18 の作品だけを読む
 * （R18G は見る人が自分で表示を選ぶものなので、だれにでも同じ HTML を返すこの一覧には出さない）
 */
export async function loadReadingWorks(
  kind: ReadingKind,
  request: Request,
  options: { isSensitive?: boolean } = {},
) {
  const isSensitive = options.isSensitive === true
  const config = READING_CONFIGS[kind]
  const params = new URL(request.url).searchParams

  const page = parseWorksIndexPage(params.get("page"))
  const sort = parseSort(params.get("sort"), config.defaultSort)
  const q = (params.get("q") ?? "").trim().slice(0, QUERY_MAX_LENGTH)

  const result = await loaderClient.query({
    query: ReadingWorksQuery,
    variables: {
      offset: page * WORKS_INDEX_PER_PAGE,
      limit: WORKS_INDEX_PER_PAGE,
      where: {
        workType: config.workType,
        ...(isSensitive
          ? { ratings: ["R18"] as const }
          : { ratings: ["G"] as const, isSensitive: false }),
        isNowCreatedAt: true,
        orderBy: sort === "popular" ? "LIKES_COUNT" : "DATE_CREATED",
        ...(q === "" ? {} : { search: q }),
      },
    },
  })

  const count = result.data.worksCount
  const lastPage = toLastPage(count)

  // 無いページを 200 で返すと、検索エンジンに中身のないページとして残る
  if (page > lastPage) {
    throw new Response(null, { status: 404 })
  }

  const works: ReadingWork[] = result.data.works
    // ratings を R18 にしても R18G が返ることがあるので評価でも確かめる
    .filter((work) => !isSensitive || work.rating === "R18")
    .map((work) => {
      const { description, createdAt, rating: _rating, ...rest } = work
      return {
        ...rest,
        excerpt: toWorkExcerpt(description),
        dateText: JST_DATE_FORMAT.format(new Date(createdAt * 1000)),
      }
    })

  return {
    kind,
    isSensitive,
    works,
    count,
    page,
    lastPage,
    sort,
    q,
    /** ぴくたーちゃんのセリフを日ごとに変える */
    seed: Math.floor(Date.now() / DAY_MS),
  }
}

export type ReadingWorksData = Awaited<ReturnType<typeof loadReadingWorks>>

const ReadingWorksQuery = graphql(
  `query ReadingWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput!) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...ReadingWork
    }
    worksCount(where: $where)
  }`,
  [ReadingWorkFragment],
)
