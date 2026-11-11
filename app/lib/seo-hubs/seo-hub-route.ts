import type { HeadersFunction } from "@remix-run/cloudflare"
import { config, META } from "~/config"
import type { SeoHubData } from "~/lib/seo-hubs/seo-hub-data.server"
import {
  buildHubDescription,
  buildHubTitle,
} from "~/lib/seo-hubs/seo-hub-text"
import { createMeta } from "~/utils/create-meta"
import { createSensitiveMeta } from "~/utils/create-sensitive-meta"

/**
 * 呪文まとめのルートで共通の headers・meta
 */

/**
 * 集計は 1 日単位で十分なので、配信のキャッシュに 1 日載せる（期限後も 1 日は古いものを返して裏で作り直す）
 * ログイン中も同じ HTML（ログイン状態で変わる部分は画面で読む）
 */
export const seoHubHeaders: HeadersFunction = () => ({
  "Cache-Control":
    "public, max-age=0, s-maxage=86400, stale-while-revalidate=86400",
})

export function seoHubMeta(data: SeoHubData | undefined, lang?: string) {
  const locale = lang === "en" ? "en" : "ja"
  if (!data) {
    return [{ title: "404 - Aipictors" }, { name: "robots", content: "noindex" }]
  }
  const values = {
    title: buildHubTitle(data, "ja"),
    enTitle: buildHubTitle(data, "en"),
    description: buildHubDescription(data, "ja"),
    enDescription: buildHubDescription(data, "en"),
    url:
      data.thumbnailUrl ??
      data.popularWorks[0]?.largeThumbnailImageURL ??
      config.defaultOgpImageUrl,
  }
  const metaData = { ...META.TAGS, isIndex: data.isIndexable }
  return data.isSensitive
    ? createSensitiveMeta(metaData, values, locale)
    : createMeta(metaData, values, locale)
}

type HubIndexMetaInput = {
  isSensitive: boolean
  characters: { name: string }[]
  series: { name: string }[]
}

export function seoHubIndexMeta(
  data: HubIndexMetaInput | undefined,
  lang?: string,
) {
  const isSensitive = data?.isSensitive ?? false
  const sample = [...(data?.characters ?? []), ...(data?.series ?? [])]
    .slice(0, 5)
    .map((item) => item.name)
    .join("・")
  const values = {
    title: isSensitive
      ? "R18 AIイラストの呪文（プロンプト）まとめ"
      : "AIイラストの呪文（プロンプト）まとめ｜キャラ・タグ・モデル別",
    enTitle: isSensitive
      ? "R18 AI art prompt collections"
      : "AI art prompt collections by character, tag and model",
    description: isSensitive
      ? "18歳以上の方向けのAIイラストの呪文（プロンプト）を、タグ・モデルごとにまとめました。よく使われる語・使われたモデル・人気作品を見られます。"
      : `AIイラストの呪文（プロンプト）を、キャラクター・タグ・モデルごとにまとめました。${
          sample ? `${sample}など、` : ""
        }人気作品でよく使われる語・使われたモデル・呪文の例を見られます。`,
    enDescription:
      "Prompt collections for AI illustrations on Aipictors, by character, tag and model: common words, models and example prompts from popular works.",
    url: config.defaultOgpImageUrl,
  }
  return isSensitive
    ? createSensitiveMeta({ ...META.TAGS }, values, lang)
    : createMeta({ ...META.TAGS }, values, lang)
}
