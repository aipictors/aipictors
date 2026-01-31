import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { config } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import { SearchHeader } from "~/routes/($lang)._main.search/components/search-header"
import { SearchHints } from "~/routes/($lang)._main.search/components/search-hints"
import { SearchResults } from "~/routes/($lang)._main.search/components/search-results"

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  const url = new URL(props.request.url)

  const tag = url.searchParams.get("tag")
  const q = url.searchParams.get("q")
  const model =
    url.searchParams.get("workModelId") ?? url.searchParams.get("model")

  // Build where condition
  const whereCondition: Record<string, unknown> = {
    // /search は基本的に G + R15 を表示（SearchResults のデフォルトと合わせる）
    ratings: ["G", "R15"],
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
  const navigate = useNavigate()

  if (data === null) {
    return null
  }

  const searchQuery = searchParams.get("q")
  const tagQuery = searchParams.get("tag")
  const modelQuery =
    searchParams.get("workModelId") ?? searchParams.get("model")

  const hasAnySearchQuery = Boolean(searchQuery || tagQuery || modelQuery)

  const orderLabel = (() => {
    const orderBy = searchParams.get("orderBy")
    const sort = searchParams.get("sort")

    const base = (() => {
      switch (orderBy) {
        case "DATE_CREATED":
          return "新着順"
        case "VIEWS_COUNT":
          return "閲覧数順"
        case "COMMENTS_COUNT":
          return "コメント順"
        case "BOOKMARKS_COUNT":
          return "ブックマーク順"
        case "NAME":
          return "タイトル順"
        default:
          return "人気順（いいね）"
      }
    })()

    if (sort === "ASC") return `${base}（昇順）`
    return base
  })()

  const modelLabel = (() => {
    if (!modelQuery) return null
    const m = data.models.find(
      (x) => x.workModelId === modelQuery || x.id === modelQuery,
    )

    return m?.displayName ?? modelQuery
  })()

  const stateLabel = (() => {
    // 🏷 タグクリック時
    if (tagQuery) {
      const tags = tagQuery
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
      if (tags.length >= 2) {
        return `🏷 #${tags[0]} × #${tags[1]} の作品一覧（${orderLabel}）`
      }
      return `🏷 #${tagQuery} の作品一覧（${orderLabel}）`
    }

    // 🔍 キーワード検索時
    if (searchQuery) {
      return modelLabel
        ? `🔍 「${searchQuery}」の検索結果（${orderLabel}・${modelLabel}）`
        : `🔍 「${searchQuery}」の検索結果（${orderLabel}）`
    }

    // 🎨 AIモデルのみ
    if (modelQuery) {
      return modelLabel
        ? `${modelLabel} の作品一覧（${orderLabel}）`
        : `モデルの作品一覧（${orderLabel}）`
    }

    // 🔰 初期表示
    return "⭐ おすすめ作品（Aipictorsピック）"
  })()

  const beginnerChips = [
    "かわいい",
    "ファンタジー",
    "SF",
    "アニメ風",
    "写実",
    "風景",
    "ポートレート",
    "サイバーパンク",
    "魔法使い",
    "青髪",
  ]

  const onChipClick = (chip: string) => {
    const params = new URLSearchParams()
    params.set("q", chip)
    navigate(`/search?${params.toString()}`)
  }

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 pt-4">
        <SearchHeader models={data.models} />

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-sm">
          <span className="font-medium text-foreground">{stateLabel}</span>
        </div>

        {/* 入力しなくても使える：初心者向けタグチップ */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {beginnerChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onChipClick(chip)}
              className="shrink-0 rounded-full border bg-background px-3 py-1 text-sm hover:bg-muted"
            >
              {`#${chip}`}
            </button>
          ))}
        </div>
      </div>

      {/* 直下に即グリッド（初期状態でも必ず作品が見える） */}
      <div className="mx-auto max-w-6xl px-4 py-4">
        <SearchResults
          models={data.models}
          initialWorks={data.workResp}
          mode="explore"
        />

        {/* 下層：ヒント（情報は出しすぎず、必要なら深掘り） */}
        <div className="mt-6">
          <details>
            <summary className="cursor-pointer text-muted-foreground text-sm">
              {hasAnySearchQuery
                ? "さらに探す（雰囲気・トレンド・画風）"
                : "さらに探す（雰囲気・トレンド・画風）"}
            </summary>
            <div className="mt-4">
              <SearchHints
                popularTags={data.popularTags}
                popularKeywords={data.popularKeywords}
                popularModels={data.popularModels}
              />
            </div>
          </details>
        </div>
      </div>
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
