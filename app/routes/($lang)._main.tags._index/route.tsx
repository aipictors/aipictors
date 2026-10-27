import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config, META } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import { TagsIndexView } from "~/routes/($lang)._main.tags._index/components/tags-index-view"
import { createMeta } from "~/utils/create-meta"

export async function loader(props: LoaderFunctionArgs) {
  const url = new URL(props.request.url)
  const isSensitive = url.pathname.includes("/r/tags")

  const [hotResp, popularResp] = await Promise.all([
    loaderClient.query({ query: hotTagsQuery, variables: {} }),
    loaderClient.query({
      query: popularTagsQuery,
      variables: { limit: 48, where: { isSensitive } },
    }),
  ])

  const hotTags = (
    isSensitive ? hotResp.data.hotSensitiveTags : hotResp.data.hotTags
  )
    .map((tag) => ({
      name: tag.name,
      worksCount: tag.worksCount,
      thumbnailUrl: tag.firstWork?.smallThumbnailImageURL ?? null,
    }))
    .slice(0, 12)

  const hotNames = new Set(hotTags.map((tag) => tag.name))
  const popularTags = popularResp.data.recommendedTags
    .filter((tag) => !hotNames.has(tag.tagName))
    .map((tag) => ({ name: tag.tagName, thumbnailUrl: tag.thumbnailUrl }))

  const usedNames = new Set([
    ...hotNames,
    ...popularTags.map((tag) => tag.name),
  ])
  const commonTags = isSensitive
    ? []
    : hotResp.data.homeTags
        .map((tag) => tag.name)
        .filter((name) => !usedNames.has(name))

  return { isSensitive, hotTags, popularTags, commonTags }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
})

export const meta: MetaFunction<typeof loader> = (props) => {
  const isSensitive = props.data?.isSensitive ?? false
  const sample = [
    ...(props.data?.hotTags ?? []).map((tag) => tag.name),
    ...(props.data?.popularTags ?? []).map((tag) => tag.name),
  ]
    .slice(0, 6)
    .join("・")
  return createMeta(
    { ...META.TAGS, isIndex: !isSensitive },
    {
      title: isSensitive ? "センシティブなタグ一覧" : "タグ一覧・人気のタグ",
      enTitle: isSensitive ? "Sensitive tags" : "Tags",
      description: `AIイラストを人気のタグ・いま増えているタグから探せます。${
        sample ? `${sample}など、` : ""
      }タグごとにAIイラスト・AI画像の一覧を見られます。`,
      enDescription:
        "Browse AI illustrations by popular and trending tags on Aipictors.",
      url:
        props.data?.hotTags?.[0]?.thumbnailUrl ??
        props.data?.popularTags?.[0]?.thumbnailUrl ??
        config.defaultOgpImageUrl,
    },
    props.params.lang,
  )
}

export default function Tags() {
  const data = useLoaderData<typeof loader>()
  return <TagsIndexView {...data} />
}

const hotTagsQuery = graphql(`
  query TagsIndexHotTags {
    hotTags {
      name
      worksCount
      firstWork {
        smallThumbnailImageURL
      }
    }
    hotSensitiveTags {
      name
      worksCount
      firstWork {
        smallThumbnailImageURL
      }
    }
    homeTags {
      name
    }
  }
`)

const popularTagsQuery = graphql(`
  query TagsIndexPopularTags($limit: Int!, $where: RecommendedTagsWhereInput!) {
    recommendedTags(limit: $limit, where: $where) {
      tagName
      thumbnailUrl
    }
  }
`)
