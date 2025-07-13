import { loaderClient } from "~/lib/loader-client"
import { SearchHeader } from "~/routes/($lang)._main.search/components/search-header"
import { SearchResults } from "~/routes/($lang)._main.search/components/search-results"
import { SearchHints } from "~/routes/($lang)._main.search/components/search-hints"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { config } from "~/config"
import { useSearchParams } from "@remix-run/react"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  const url = new URL(props.request.url)

  const tag = url.searchParams.get("tag")
  const q = url.searchParams.get("q")
  const model = url.searchParams.get("model")

  // Build where condition
  const whereCondition: Record<string, unknown> = {
    ratings: ["G"],
    orderBy: "LIKES_COUNT",
  }

  // Add search query
  if (q) {
    whereCondition.search = q
  }

  // Add tag search (legacy support)
  if (tag) {
    whereCondition.tagNames = [tag]
  }

  // Add model search
  if (model) {
    whereCondition.modelPostedIds = [model]
  }

  const worksResp = await loaderClient.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 16,
      where: whereCondition,
    },
  })

  // AIモデル一覧を取得
  const modelsResp = await loaderClient.query({
    query: aiModelsQuery,
    variables: {},
  })

  // 人気タグを取得（タグ使用数順）
  const popularTagsResp = await loaderClient.query({
    query: popularTagsQuery,
    variables: { limit: 20 },
  })

  // よく検索されているキーワード（サンプルデータ、実際のAPI実装時に差し替え）
  const popularKeywords = [
    "イラスト",
    "アニメ",
    "キャラクター",
    "風景",
    "ポートレート",
    "ファンタジー",
    "サイバーパンク",
    "かわいい",
    "美少女",
    "メカ",
    "ドラゴン",
    "魔法使い",
  ]

  return {
    workResp: worksResp.data?.works ?? [],
    models:
      modelsResp.data?.aiModels
        ?.map((model) => ({
          id: model.workModelId || model.id,
          name: model.name,
          displayName: model.name,
          workModelId: model.workModelId || model.id,
          thumbnailImageURL: model.thumbnailImageURL,
        }))
        .filter((model) => model.id) || [],
    popularTags:
      popularTagsResp.data?.recommendedTags
        ?.map((tag) => ({
          id: tag.tagName, // tagNameをidとして使用
          name: tag.tagName,
          count: 0, // recommendedTagsには件数がないため0を設定
          thumbnailUrl: tag.thumbnailUrl, // サムネイルURLを追加
        }))
        .slice(0, 15) || [], // 表示用に15個に制限
    popularKeywords: popularKeywords.slice(0, 12), // 表示用に12個に制限
    popularModels:
      modelsResp.data?.aiModels
        ?.filter((model) => model.thumbnailImageURL) // サムネイルがあるもののみ
        ?.map((model) => ({
          id: model.workModelId || model.id,
          name: model.name,
          displayName: model.name,
          workModelId: model.workModelId || model.id,
          thumbnailImageURL: model.thumbnailImageURL || undefined,
        }))
        .slice(0, 8) || [], // 表示用に8個に制限
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function Search() {
  const data = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()

  if (data === null) {
    return null
  }

  const searchQuery = searchParams.get("q")
  const tagQuery = searchParams.get("tag")
  const modelQuery = searchParams.get("workModelId")

  console.log("modelQuery:", modelQuery)

  const hasAnySearchQuery = Boolean(searchQuery || tagQuery || modelQuery)

  return (
    <>
      <div className="m-auto md:max-w-96">
        <SearchHeader models={data.models} />
      </div>

      {/* 検索クエリがない場合は検索ヒントを表示 */}
      {!hasAnySearchQuery ? (
        <div className="mx-auto max-w-4xl px-4 py-6">
          <SearchHints
            popularTags={data.popularTags}
            popularKeywords={data.popularKeywords}
            popularModels={data.popularModels}
          />
        </div>
      ) : (
        /* 検索結果を表示 */
        <SearchResults models={data.models} />
      )}
    </>
  )
}

export const meta: MetaFunction = (props) => {
  const searchQuery = props.params?.q || ""

  let title = "検索 - Aipictors"
  let description =
    "AI生成イラストを検索できます。様々なタグやフィルターを使って、お気に入りの作品を見つけましょう。"

  if (searchQuery) {
    title = `「${searchQuery}」の検索結果 - Aipictors`
    description = `「${searchQuery}」に関するAI生成イラストの検索結果を表示しています。`
  }

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    {
      name: "robots",
      content: searchQuery ? "noindex, follow" : "index, follow",
    },
  ]
}

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PhotoAlbumWork
    }
  }`,
  [PhotoAlbumWorkFragment],
)

const aiModelsQuery = graphql(
  `query AiModels {
    aiModels(offset: 0, limit: 124, where: {}) {
      id
      name
      type
      generationModelId
      workModelId
      thumbnailImageURL
    }
  }`,
)

const popularTagsQuery = graphql(
  `query PopularTags($limit: Int!) {
    recommendedTags(limit: $limit, where: { isSensitive: false }) {
      tagName
      thumbnailUrl
    }
  }`,
)
