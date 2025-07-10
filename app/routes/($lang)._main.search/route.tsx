import { loaderClient } from "~/lib/loader-client"
import { SearchHeader } from "~/routes/($lang)._main.search/components/search-header"
import { SearchResults } from "~/routes/($lang)._main.search/components/search-results"
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

  const worksResp = await loaderClient.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        ratings: ["G"],
        orderBy: "LIKES_COUNT",
        ...(tag && { tagNames: [tag] }),
      },
    },
  })

  // AIモデル一覧を取得
  const modelsResp = await loaderClient.query({
    query: aiModelsQuery,
    variables: {},
  })

  return {
    workResp: worksResp.data?.works ?? [],
    models:
      modelsResp.data?.aiModels
        ?.map((model) => ({
          id: model.workModelId || model.id,
          name: model.name,
          displayName: model.name,
          workModelId: model.workModelId || model.id,
        }))
        .filter((model) => model.id) || [],
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

  return (
    <>
      <div className="m-auto md:max-w-96">
        <SearchHeader />
      </div>
      {/* 検索結果または新着作品一覧 */}
      {searchQuery ? (
        <SearchResults models={data.models} />
      ) : (
        <SearchResults
          models={data.models}
          initialWorks={data.workResp}
          showLatestWorks={true}
        />
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
