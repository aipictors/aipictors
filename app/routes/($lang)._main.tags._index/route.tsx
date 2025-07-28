import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { loaderClient } from "~/lib/loader-client"
import { graphql } from "gql.tada"
import { TagsHeader } from "~/routes/($lang)._main.tags._index/components/tags-header"
import { TrendingTagsSection } from "~/routes/($lang)._main.tags._index/components/trending-tags-section"
import { TagCategoriesSection } from "~/routes/($lang)._main.tags._index/components/tag-categories-section"
import { TagCloudSection } from "~/routes/($lang)._main.tags._index/components/tag-cloud-section"
import { PopularTagsSection } from "~/routes/($lang)._main.tags._index/components/popular-tags-section"
import { TagSearchSection } from "~/routes/($lang)._main.tags._index/components/tag-search-section-new"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import type { RecommendedTag } from "~/routes/($lang)._main.tags._index/types/tag"

export async function loader(props: LoaderFunctionArgs) {
  const url = new URL(props.request.url)
  const isSensitive = url.pathname.includes("/r/tags")
  const searchTerm = url.searchParams.get("search")

  // 各セクション用に異なるタグセットを取得
  const [trendingResult, cloudResult, categoriesResult, popularResult] =
    await Promise.all([
      // トレンドタグ用
      loaderClient.query({
        query: tagsQuery,
        variables: {
          limit: 12,
          where: { isSensitive },
        },
      }),
      // タグクラウド用
      loaderClient.query({
        query: tagsQuery,
        variables: {
          limit: 12,
          where: { isSensitive },
        },
      }),
      // カテゴリ別タグ用
      loaderClient.query({
        query: tagsQuery,
        variables: {
          limit: 20,
          where: { isSensitive },
        },
      }),
      // 人気タグ用
      loaderClient.query({
        query: tagsQuery,
        variables: {
          limit: 15,
          where: { isSensitive },
        },
      }),
    ])

  // 検索結果がある場合は作品データも取得
  let searchWorks = null
  if (searchTerm) {
    const searchResult = await loaderClient.query({
      query: searchWorksQuery,
      variables: {
        offset: 0,
        limit: 32,
        where: {
          search: searchTerm,
          ...(isSensitive && {
            ratings: ["R18", "R18G"],
            isSensitive: true,
          }),
        },
      },
    })
    searchWorks = searchResult.data.works
  }

  return json({
    trendingTags: trendingResult.data.recommendedTags,
    cloudTags: cloudResult.data.recommendedTags,
    categoryTags: categoriesResult.data.recommendedTags,
    popularTags: popularResult.data.recommendedTags,
    searchWorks,
    searchTerm,
    isSensitive,
  })
}

export default function Tags() {
  const data = useLoaderData<typeof loader>()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto space-y-12 px-4 py-8">
        {/* ヘッダーセクション */}
        <TagsHeader />

        {/* 検索セクション */}
        <TagSearchSection
          isSensitive={data.isSensitive}
          searchWorks={data.searchWorks}
          searchTerm={data.searchTerm}
        />

        {/* トレンドタグセクション */}
        <TrendingTagsSection tags={data.trendingTags as RecommendedTag[]} />

        {/* タグクラウドセクション */}
        <TagCloudSection tags={data.cloudTags as RecommendedTag[]} />

        {/* カテゴリ別タグセクション */}
        <TagCategoriesSection tags={data.categoryTags as RecommendedTag[]} />

        {/* 人気タグセクション */}
        <PopularTagsSection tags={data.popularTags as RecommendedTag[]} />
      </div>
    </div>
  )
}

const tagsQuery = graphql(`
  query TagsPage($limit: Int!, $where: RecommendedTagsWhereInput!) {
    recommendedTags(limit: $limit, where: $where) {
      tagName
      thumbnailUrl
    }
  }
`)

const searchWorksQuery = graphql(
  `
  query SearchWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PhotoAlbumWork
    }
  }
`,
  [PhotoAlbumWorkFragment],
)
