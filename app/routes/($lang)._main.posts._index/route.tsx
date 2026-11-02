import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql, type VariablesOf } from "gql.tada"
import { GenreWorkCardFragment } from "~/components/genre-works/genre-work-card"
import { GENRE_CONFIGS } from "~/components/genre-works/genre-works-config"
import {
  parseWorksIndexPage,
  toLastPage,
  WORKS_INDEX_MAX_PAGE,
  WORKS_INDEX_PER_PAGE,
} from "~/components/works-index/works-index-params"
import { config, META } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import {
  isPostsIndexSort,
  PostsIndexView,
  type PostsIndexSort,
} from "~/routes/($lang)._main.posts._index/components/posts-index-view"
import { createMeta } from "~/utils/create-meta"

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * 日単位に丸めた N 日前（秒まで渡すとキャッシュのたびに条件が変わる）
 */
const toDaysAgoIso = (days: number) =>
  new Date(
    Math.floor(Date.now() / DAY_MS) * DAY_MS - days * DAY_MS,
  ).toISOString()

type WorksWhere = VariablesOf<typeof PostsIndexListQuery>["where"]

/** 全年齢で公開中の作品 */
const BASE_WHERE: WorksWhere = {
  ratings: ["G"],
  isSensitive: false,
  isNowCreatedAt: true,
}

const toListWhere = (sort: PostsIndexSort): WorksWhere => {
  if (sort === "week") {
    return {
      ...BASE_WHERE,
      orderBy: "LIKES_COUNT",
      createdAtAfter: toDaysAgoIso(7),
    }
  }
  if (sort === "popular") {
    return { ...BASE_WHERE, orderBy: "LIKES_COUNT" }
  }
  return { ...BASE_WHERE, orderBy: "DATE_CREATED" }
}

export async function loader(props: LoaderFunctionArgs) {
  const params = new URL(props.request.url).searchParams
  const page = parseWorksIndexPage(params.get("page"))
  const sortParam = params.get("sort")
  const sort: PostsIndexSort = isPostsIndexSort(sortParam) ? sortParam : "new"

  const [listResult, entries] = await Promise.all([
    loaderClient.query({
      query: PostsIndexListQuery,
      variables: {
        offset: page * WORKS_INDEX_PER_PAGE,
        limit: WORKS_INDEX_PER_PAGE,
        where: toListWhere(sort),
        isWeek: sort === "week",
      },
    }),
    // ジャンルの入口は 1 ページ目にだけ出す
    page === 0 ? loadEntries() : null,
  ])

  const { works, weekCount } = listResult.data
  // 全作品の数え上げは API で 2 秒かかる。どうせ上限のページ数を超えるので、期間で絞るときだけ数える
  const lastPage =
    sort === "week" ? toLastPage(weekCount ?? 0) : WORKS_INDEX_MAX_PAGE

  if (page > lastPage || (page > 0 && works.length === 0)) {
    throw new Response(null, { status: 404 })
  }

  return {
    works,
    page,
    lastPage,
    sort,
    entries,
    /** ぴくたーちゃんのセリフを日ごとに変える */
    seed: Math.floor(Date.now() / DAY_MS),
  }
}

const loadEntries = async () => {
  const toCoverWhere = (style: WorksWhere["style"]): WorksWhere => ({
    ...BASE_WHERE,
    style,
    workType: "WORK",
    orderBy: "LIKES_COUNT",
    createdAtAfter: toDaysAgoIso(30),
  })

  const { data } = await loaderClient.query({
    query: PostsIndexEntriesQuery,
    variables: {
      cover2d: toCoverWhere(GENRE_CONFIGS["2d"].style),
      cover25d: toCoverWhere(GENRE_CONFIGS["2.5d"].style),
      cover3d: toCoverWhere(GENRE_CONFIGS["3d"].style),
      novel: { ...BASE_WHERE, workType: "NOVEL", orderBy: "LIKES_COUNT" },
      column: { ...BASE_WHERE, workType: "COLUMN", orderBy: "LIKES_COUNT" },
    },
  })

  return {
    covers: {
      "2d": data.cover2d[0]?.smallThumbnailImageURL ?? null,
      "2.5d": data.cover25d[0]?.smallThumbnailImageURL ?? null,
      "3d": data.cover3d[0]?.smallThumbnailImageURL ?? null,
      novel: data.novelCover[0]?.smallThumbnailImageURL ?? null,
      column: data.columnCover[0]?.smallThumbnailImageURL ?? null,
    },
    novelsCount: data.novelsCount,
    columnsCount: data.columnsCount,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export const meta: MetaFunction<typeof loader> = (props) => {
  const page = props.data?.page ?? 0
  const base = META.POSTS_INDEX
  return createMeta(
    {
      ...base,
      title: page > 0 ? `${base?.title}（${page + 1}ページ目）` : base?.title,
      enTitle:
        page > 0 ? `${base?.enTitle} (Page ${page + 1})` : base?.enTitle,
      image: props.data?.entries?.covers["2d"] ?? undefined,
      // 人気順は同じ作品の並べ替えなので、新着順だけを検索エンジンに載せる
      isIndex: props.data === undefined || props.data.sort === "new",
    },
    undefined,
    props.params.lang,
  )
}

/**
 * すべての作品の入口
 */
export default function Posts() {
  const data = useLoaderData<typeof loader>()

  return <PostsIndexView data={data} />
}

const PostsIndexListQuery = graphql(
  `query PostsIndexList(
    $offset: Int!
    $limit: Int!
    $where: WorksWhereInput!
    $isWeek: Boolean!
  ) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...GenreWorkCard
    }
    weekCount: worksCount(where: $where) @include(if: $isWeek)
  }`,
  [GenreWorkCardFragment],
)

const PostsIndexEntriesQuery = graphql(
  `query PostsIndexEntries(
    $cover2d: WorksWhereInput!
    $cover25d: WorksWhereInput!
    $cover3d: WorksWhereInput!
    $novel: WorksWhereInput!
    $column: WorksWhereInput!
  ) {
    cover2d: works(offset: 0, limit: 1, where: $cover2d) {
      smallThumbnailImageURL
    }
    cover25d: works(offset: 0, limit: 1, where: $cover25d) {
      smallThumbnailImageURL
    }
    cover3d: works(offset: 0, limit: 1, where: $cover3d) {
      smallThumbnailImageURL
    }
    novelCover: works(offset: 0, limit: 1, where: $novel) {
      smallThumbnailImageURL
    }
    columnCover: works(offset: 0, limit: 1, where: $column) {
      smallThumbnailImageURL
    }
    novelsCount: worksCount(where: $novel)
    columnsCount: worksCount(where: $column)
  }`,
)
