import { loaderClient } from "~/lib/loader-client"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { config, META } from "~/config"
import { TagPageView } from "~/routes/($lang)._main.tags.$tag._index/components/tag-page-view"
import {
  collectCreators,
  collectRelatedTags,
  fetchTagWorks,
  fetchTagWorksCount,
} from "~/routes/($lang)._main.tags.$tag._index/tag-page-data"
import {
  isTagPageDefaultView,
  parseTagPageQuery,
  toRatings,
} from "~/routes/($lang)._main.tags.$tag._index/tag-page-query"
import { findHubTag, toHubTagPath } from "~/lib/seo-hubs/seo-hub-catalog.server"
import { createMeta } from "~/utils/create-meta"
import { toListWorks } from "~/utils/to-list-works"

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

  // 英語の検索で見つかるように、英語のページのタイトルと見出しは英語名にする
  const enTagName =
    props.params.lang === "en" && !isR18Fallback
      ? await loaderClient
          .query({
            query: tagEnNameQuery,
            variables: { name: tagName },
          })
          .then((result) => result.data.tagEnName ?? null)
          .catch(() => null)
      : null

  return {
    tag: tagName,
    enTagName,
    works: toListWorks(works),
    worksCount,
    query,
    isR18Fallback,
    relatedTags: isR18Fallback ? [] : collectRelatedTags(works, tagName),
    creators: isR18Fallback ? [] : collectCreators(works),
    promptHubPath: findHubTag(tagName, false)
      ? toHubTagPath(tagName, false)
      : null,
  }
}

export const headers: HeadersFunction = () => ({
  // 未ログインの表示は Worker のキャッシュから返す（ログイン中は entry.server でキャッシュを使わない）
  "Cache-Control":
    "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
})

export const meta: MetaFunction<typeof loader> = (props) => {
  if (!props.data) {
    return [{ title: "タグ" }]
  }

  const { tag, enTagName, worksCount, query, relatedTags, isR18Fallback } =
    props.data
  const enTag = enTagName ? `${enTagName} (${tag})` : tag
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
      isIndex: worksCount > 0 && !isR18Fallback && isTagPageDefaultView(query),
    },
    {
      title: `${tag}のAIイラスト・画像 ${worksCount.toLocaleString()}件${pageSuffixJa}`,
      enTitle: `${enTag} AI art & images (${worksCount.toLocaleString()})${pageSuffixEn}`,
      description: `「${tag}」タグのAIイラスト・AI画像を${worksCount.toLocaleString()}件掲載。${
        relatedText ? `${relatedText} など関連タグの作品や、` : ""
      }プロンプト付きの作品も探せます。AI画像投稿・生成サイト Aipictors（AIピクターズ）`,
      enDescription: `Browse ${worksCount.toLocaleString()} AI illustrations and images tagged "${enTag}" on Aipictors${
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

const tagEnNameQuery = graphql(
  `query TagEnName($name: String!) {
    tagEnName(name: $name)
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
