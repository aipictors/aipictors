import catalog from "~/lib/seo-hubs/seo-hub-catalog.json"

/**
 * 呪文まとめの索引（scripts/seo-hubs/generate.ts が本番 D1 の集計から作る JSON）
 * 画面の表示時には D1 を読まずに、この一覧から索引・内部リンク・サイトマップを作る
 */

export type HubTagKind = "character" | "series" | "tag"

export type HubTag = { name: string; count: number; kind: HubTagKind }

export type HubModel = { name: string; count: number }

/** まとめを検索エンジンに載せる最低の作品数（全年齢は G、R18 は R18 の件数） */
export const HUB_MIN_INDEX_WORKS = 30
/** 呪文を公開している安全な作品がこれより少なければ、まとめとしては薄いので載せない */
export const HUB_MIN_PROMPT_WORKS = 6

const key = (name: string) => name.normalize("NFKC").toLowerCase()

const tags = catalog.tags as HubTag[]
const sensitiveTags = catalog.sensitiveTags.map((tag) => ({
  ...tag,
  kind: "tag" as const,
})) as HubTag[]
const models = catalog.models as HubModel[]
const sensitiveModels = catalog.sensitiveModels as HubModel[]

const toMap = <T extends { name: string }>(items: T[]) =>
  new Map(items.map((item) => [key(item.name), item]))

const tagMap = toMap(tags)
const sensitiveTagMap = toMap(sensitiveTags)
const modelMap = toMap(models)
const sensitiveModelMap = toMap(sensitiveModels)

export const hubCatalogGeneratedAt = catalog.generatedAt

export function listHubTags(isSensitive: boolean): HubTag[] {
  return isSensitive ? sensitiveTags : tags
}

export function listHubModels(isSensitive: boolean): HubModel[] {
  return isSensitive ? sensitiveModels : models
}

export function findHubTag(name: string, isSensitive: boolean) {
  return (isSensitive ? sensitiveTagMap : tagMap).get(key(name)) ?? null
}

export function findHubModel(name: string, isSensitive: boolean) {
  return (isSensitive ? sensitiveModelMap : modelMap).get(key(name)) ?? null
}

export const toHubTagPath = (name: string, isSensitive: boolean) =>
  `${isSensitive ? "/r" : ""}/prompts/tags/${encodeURIComponent(name)}`

export const toHubModelPath = (name: string, isSensitive: boolean) =>
  `${isSensitive ? "/r" : ""}/prompts/models/${encodeURIComponent(name)}`

/**
 * まとめのあるタグはまとめへ、ないタグは通常のタグページへ
 */
export const toTagLinkPath = (name: string, isSensitive: boolean) =>
  findHubTag(name, isSensitive)
    ? toHubTagPath(name, isSensitive)
    : `${isSensitive ? "/r" : ""}/tags/${encodeURIComponent(name)}`

/**
 * 索引ページ（/prompts・/r/prompts）のデータ
 */
export function loadHubIndex(isSensitive: boolean) {
  const pick = (kind: HubTagKind) =>
    listHubTags(isSensitive)
      .filter((tag) => tag.kind === kind)
      .map((tag) => ({ name: tag.name, count: tag.count }))
  return {
    isSensitive,
    characters: pick("character"),
    series: pick("series"),
    tags: pick("tag"),
    models: listHubModels(isSensitive).map((model) => ({
      name: model.name,
      count: model.count,
    })),
    generatedAt: hubCatalogGeneratedAt,
  }
}
