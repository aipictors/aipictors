import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { config, META } from "~/config"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { loaderClient } from "~/lib/loader-client"
import { TagPageView } from "~/routes/($lang)._main.tags.$tag._index/components/tag-page-view"
import {
  parseTagPageQuery,
  TAG_PAGE_SIZE,
  toRatings,
} from "~/routes/($lang)._main.tags.$tag._index/tag-page-query"
import { createMeta } from "~/utils/create-meta"

type TagWork = NonNullable<
  Awaited<ReturnType<typeof fetchTagWorks>>
>[number]

async function fetchTagWorks(props: {
  tagName: string
  page: number
  orderBy: IntrospectionEnum<"WorkOrderBy">
  sort: "ASC" | "DESC"
  ratings: ("G" | "R15" | "R18" | "R18G")[]
  hasPrompt: boolean
  isSensitive: boolean
}) {
  const resp = await loaderClient.query({
    query: tagPageWorksQuery,
    variables: {
      offset: props.page * TAG_PAGE_SIZE,
      limit: TAG_PAGE_SIZE,
      where: {
        tagNames: [props.tagName],
        orderBy: props.orderBy,
        sort: props.sort,
        ratings: props.ratings,
        ...(props.hasPrompt && { hasPrompt: true, isPromptPublic: true }),
        ...(props.isSensitive && { isSensitive: true }),
        isNowCreatedAt: true,
      },
    },
  })
  return resp.data.tagWorks
}

async function fetchTagWorksCount(
  tagName: string,
  ratings: ("G" | "R15" | "R18" | "R18G")[],
) {
  const resp = await loaderClient.query({
    query: tagPageWorksCountQuery,
    variables: { where: { tagName, ratings } },
  })
  return resp.data.tagWorksCount
}

/**
 * 一覧に出ている作品のタグから、よく一緒に付けられているタグを数える
 */
const collectRelatedTags = (works: TagWork[], tagName: string) => {
  const counts = new Map<string, number>()
  const current = tagName.toLowerCase()
  for (const work of works) {
    for (const name of new Set(work.tagNames)) {
      const trimmed = name.trim()
      if (trimmed.length === 0 || trimmed.toLowerCase() === current) continue
      counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count >= 2 || works.length < 8)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 24)
    .map(([name, count]) => ({ name, count }))
}

/**
 * 一覧に出ている作品の投稿者（作品数の多い順）
 */
const collectCreators = (works: TagWork[]) => {
  const creators = new Map<
    string,
    { id: string; name: string; iconUrl: string | null; count: number }
  >()
  for (const work of works) {
    if (!work.user) continue
    const current = creators.get(work.user.id)
    if (current) {
      current.count += 1
    } else {
      creators.set(work.user.id, {
        id: work.user.id,
        name: work.user.name,
        iconUrl: work.user.iconUrl ?? null,
        count: 1,
      })
    }
  }
  return Array.from(creators.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
}

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.tag === undefined) {
    throw new Response(null, { status: 404 })
  }

  const tagName = decodeURIComponent(props.params.tag).trim()
  if (tagName.length === 0) {
    throw new Response(null, { status: 404 })
  }

  const url = new URL(props.request.url)
  const query = parseTagPageQuery(url.searchParams)
  const ratings = toRatings(query.rating)

  // 全年齢・R15 の作品と件数を同時に取る
  const [generalWorks, generalCount] = await Promise.all([
    fetchTagWorks({
      tagName,
      page: query.page,
      orderBy: query.orderBy,
      sort: query.sort,
      ratings,
      hasPrompt: query.hasPrompt,
      isSensitive: false,
    }),
    fetchTagWorksCount(tagName, ratings),
  ])

  let works = generalWorks
  let worksCount = generalCount
  let isR18Fallback = false

  // 全年齢・R15 の作品がないタグは R18 の作品を表示する（これまでの動作を引き継ぐ）
  if (generalWorks.length === 0 && query.page === 0 && query.rating === "all") {
    const [r18Works, r18Count] = await Promise.all([
      fetchTagWorks({
        tagName,
        page: 0,
        orderBy: query.orderBy,
        sort: query.sort,
        ratings: ["R18", "R18G"],
        hasPrompt: query.hasPrompt,
        isSensitive: true,
      }),
      fetchTagWorksCount(tagName, ["R18", "R18G"]),
    ])
    if (r18Works.length > 0) {
      works = r18Works
      worksCount = r18Count
      isR18Fallback = true
    }
  }

  return {
    tag: tagName,
    works,
    worksCount,
    query,
    isR18Fallback,
    relatedTags: isR18Fallback ? [] : collectRelatedTags(works, tagName),
    creators: isR18Fallback ? [] : collectCreators(works),
  }
}

export const headers: HeadersFunction = () => ({
  // 未ログインの表示は Worker のキャッシュから返す（ログイン中は entry.server でキャッシュを使わない）
  "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
})

export const meta: MetaFunction<typeof loader> = (props) => {
  if (!props.data) {
    return [{ title: "タグ" }]
  }

  const { tag, worksCount, query, relatedTags, isR18Fallback } = props.data
  const coverWork = props.data.works[0]
  const lang = props.params.lang === "en" ? "en" : "ja"
  const pageSuffixJa = query.page > 0 ? `（${query.page + 1}ページ目）` : ""
  const pageSuffixEn = query.page > 0 ? ` (page ${query.page + 1})` : ""
  const relatedText = relatedTags
    .slice(0, 4)
    .map((related) => `#${related.name}`)
    .join(" ")

  const meta = createMeta(
    {
      ...META.TAGS,
      // 作品のないタグ・R18 のみのタグ・並び替えた一覧は検索結果に出さない
      isIndex: worksCount > 0 && !isR18Fallback,
    },
    {
      title: `${tag}のAIイラスト・画像 ${worksCount.toLocaleString()}件${pageSuffixJa}`,
      enTitle: `${tag} AI art & images (${worksCount.toLocaleString()})${pageSuffixEn}`,
      description: `「${tag}」タグのAIイラスト・AI画像を${worksCount.toLocaleString()}件掲載。${
        relatedText ? `${relatedText} など関連タグの作品や、` : ""
      }プロンプト付きの作品も探せます。AI画像投稿・生成サイト Aipictors（AIピクターズ）`,
      enDescription: `Browse ${worksCount.toLocaleString()} AI illustrations and images tagged "${tag}" on Aipictors${
        relatedText ? `, with related tags like ${relatedText}` : ""
      }. Many works include their prompts and generation settings.`,
      url:
        coverWork?.largeThumbnailImageURL ??
        coverWork?.smallThumbnailImageURL ??
        config.defaultOgpImageUrl,
    },
    lang,
  )

  return meta
}

export default function TagPage() {
  const data = useLoaderData<typeof loader>()
  return <TagPageView key={data.tag} {...data} />
}

export const tagPageWorksQuery = graphql(
  `query TagPageWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    tagWorks(offset: $offset, limit: $limit, where: $where) {
      ...PhotoAlbumWork
      tagNames
      createdAt
    }
  }`,
  [PhotoAlbumWorkFragment],
)

const tagPageWorksCountQuery = graphql(
  `query TagPageWorksCount($where: TagWorksCountWhereInput!) {
    tagWorksCount(where: $where)
  }`,
)

/**
 * R18 のタグ一覧（sensitive-tag-work-section）から使う
 */
export const tagWorksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    tagWorks(offset: $offset, limit: $limit, where: $where) {
      ...PhotoAlbumWork
    }
  }`,
  [PhotoAlbumWorkFragment],
)
