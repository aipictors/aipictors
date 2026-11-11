import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
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
} from "~/routes/($lang)._main.tags.$tag._index/tag-page-query"
import { findHubTag, toHubTagPath } from "~/lib/seo-hubs/seo-hub-catalog.server"
import { createSensitiveMeta } from "~/utils/create-sensitive-meta"
import {
  isFeaturableSensitiveTag,
  isIndexableSensitiveTag,
} from "~/utils/sensitive-tag-filter"
import { toListWorks } from "~/utils/to-list-works"

const TEMPORARILY_PRIVATE_TAGS = new Set(["ロリ"])

/**
 * R18 のタグページ。画面は全年齢のタグページ（TagPageView）と同じ
 */
export async function loader(props: LoaderFunctionArgs) {
  if (props.params.tag === undefined) {
    throw new Response(null, { status: 404 })
  }

  const decodedTag = decodeURIComponent(props.params.tag).normalize("NFKC")
  if (TEMPORARILY_PRIVATE_TAGS.has(decodedTag)) {
    throw new Response(null, { status: 404 })
  }

  const url = new URL(props.request.url)
  // R18 の中では年齢区分で絞らない（URL に残っていても無視する）
  const query = {
    ...parseTagPageQuery(url.searchParams),
    rating: "all" as const,
  }
  const ratings: ("R18" | "R18G")[] = ["R18", "R18G"]

  const [works, worksCount] = await Promise.all([
    fetchTagWorks({
      tagName: decodedTag,
      page: query.page,
      orderBy: query.orderBy,
      sort: query.sort,
      ratings,
      hasPrompt: query.hasPrompt,
      isSensitive: true,
    }),
    fetchTagWorksCount(decodedTag, ratings),
  ])

  return {
    tag: decodedTag,
    works: toListWorks(works),
    worksCount,
    query,
    isR18Fallback: false,
    // 関連タグはリンクとして勧めるので、ガイドラインに触れそうな語を除く。R-18 はここでは全部に付くので出さない
    relatedTags: collectRelatedTags(works, decodedTag).filter(
      (related) =>
        isFeaturableSensitiveTag(related.name) &&
        !/^r-?18g?$/i.test(related.name),
    ),
    creators: collectCreators(works),
    promptHubPath: findHubTag(decodedTag, true)
      ? toHubTagPath(decodedTag, true)
      : null,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export const meta: MetaFunction<typeof loader> = (props) => {
  if (!props.data) {
    return createSensitiveMeta(
      META.SENSITIVE_DEFAULT,
      undefined,
      props.params.lang,
    )
  }

  const worksCount = props.data.worksCount

  const tag = decodeURIComponent(props.params.tag ?? "")

  // 未成年を連想させるタグ・実在の人物・R18G に寄ったタグと、作品のないタグ、並び替え・絞り込みの一覧は検索エンジンに載せない
  if (
    !isIndexableSensitiveTag(tag) ||
    worksCount === 0 ||
    !isTagPageDefaultView(props.data.query)
  ) {
    return createSensitiveMeta(
      META.SENSITIVE_DEFAULT,
      undefined,
      props.params.lang,
    )
  }

  return createSensitiveMeta(
    META.TAGS,
    {
      title: `${tag}のR18 AIイラスト（${worksCount}件）`,
      enTitle: `${tag} R18 AI Illustrations (${worksCount})`,
      description: `「${tag}」タグが付いた18歳以上の方向けのAIイラスト一覧です（${worksCount}件）。人気順や新着順で探せて、プロンプトを公開している作品もあります。`,
      enDescription: `${worksCount} adult AI illustrations tagged "${tag}", for people aged 18 and over. Sort by popularity or date and see prompts where they are public.`,
    },
    props.params.lang,
  )
}

export default function SensitiveTagPage() {
  const data = useLoaderData<typeof loader>()
  return <TagPageView key={data.tag} {...data} enTagName={null} isSensitive />
}
