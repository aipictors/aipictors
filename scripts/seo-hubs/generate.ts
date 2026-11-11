/**
 * 呪文まとめ（/prompts・/r/prompts）の索引に載せるタグ・モデルを、本番 D1 の集計から作る
 *
 *   set -a; . ~/.config/aipictors/cloudflare.env; set +a
 *   bun scripts/seo-hubs/generate.ts
 *
 * 出力: app/lib/seo-hubs/seo-hub-catalog.json（コミットしてデプロイ）
 * - タグは tag_counts（年齢区分ごとの作品数を持つ集計済みの表）を読むだけなので軽い（約 120 万行の読み取り）
 * - モデルは works を service ごとに数える（約 80 万行）。月に 1 回くらい作り直せば十分
 * - 最後に API で各まとめの呪文付き作品を取り、画面と同じ判定（pickHubPromptWorks）で 6 件以上あるものだけ残す
 *   （作品は多くても、呪文を公開した「まとめに出せる」作品が少ないと noindex になるので、索引とサイトマップに載せない）
 * 画面の表示時には D1 を読まない（この JSON を同梱する）
 */
import { spawnSync } from "node:child_process"
import { writeFileSync } from "node:fs"
import { join } from "node:path"
import {
  isBlockedHubModel,
  isBlockedHubTag,
  pickHubPromptWorks,
} from "../../app/lib/seo-hubs/seo-hub-safety"
import { isIndexableSensitiveTag } from "../../app/utils/sensitive-tag-filter"

const DATABASE = "aipictors-core-staging" // 本番もこの名前（aipictors-system の wrangler.jsonc）

/** 全年齢の索引に載せるタグの数と、最低の作品数（全年齢 G のみで数える） */
const MAX_TAGS = 600
const MIN_TAG_WORKS = 50
/** キャラクター・作品名は数が少なくても載せる */
const MIN_CHARACTER_WORKS = 20
const MAX_SENSITIVE_TAGS = 200
const MIN_SENSITIVE_TAG_WORKS = 60
const MIN_MODEL_WORKS = 50

/**
 * キャラクター（版権・公式キャラクター）。tag_counts の上位から手で選んだもの
 * 実在の人物に近い VTuber も、全年齢の公式キャラクターとして扱う（R18 の索引には載せない）
 */
const CHARACTERS = [
  "初音ミク",
  "鏡音リン",
  "ぴくたーちゃん",
  "ずんだもん",
  "雷電将軍",
  "甘雨",
  "刻晴",
  "神里綾華",
  "八重神子",
  "胡桃",
  "フリーナ",
  "蛍(原神)",
  "博麗霊夢",
  "霧雨魔理沙",
  "十六夜咲夜",
  "フランドール・スカーレット",
  "チルノ",
  "矢澤にこ",
  "香風智乃",
  "めぐみん",
  "御坂美琴",
  "喜多川海夢",
  "中野三玖",
  "中野二乃",
  "中野四葉",
  "星野アイ",
  "ピーチ姫",
  "砂狼シロコ",
  "サイレンススズカ",
  "マリー・ローズ",
  "戌神ころね",
  "兎田ぺこら",
  "百鬼あやめ",
  "大神ミオ",
  "風真いろは",
  "さくらみこ",
  "ときのそら",
  "紫咲シオン",
  "白上フブキ",
  "沙花叉クロヱ",
  "湊あくあ",
  "星街すいせい",
  "博衣こより",
  "音乃瀬奏",
  "AZKi",
  "しぐれうい",
  "月ノ美兎",
  "壱百満天原サロメ",
  "星川サラ",
  "天宮こころ",
  "がうる・ぐら",
  "一伊那尓栖",
  "七詩ムメイ",
  "セレス・ファウナ",
  "ハコス・ベールズ",
  "古石ビジュー",
  "フワワ・アビスガード",
  "パヴォリア・レイネ",
  "アーニャ・メルフィッサ",
  "こぼ・かなえる",
]

/** 作品・シリーズ・グループ */
const SERIES = [
  "原神",
  "ホロライブ",
  "hololive",
  "にじさんじ",
  "VTuber",
  "ぶいすぽっ！",
  "ウマ娘",
  "ウマ娘プリティーダービー",
  "ブルーアーカイブ",
  "ブルアカ",
  "東方Project",
  "東方",
  "アイドルマスター",
  "アイドルマスターシンデレラガールズ",
  "アイドルマスターシャイニーカラーズ",
  "シャニマス",
  "ボーカロイド",
  "けものフレンズ",
  "FGO",
  "ポケモン",
  "ポケットモンスター",
  "艦これ",
  "艦隊これくしょん",
  "アズールレーン",
  "ごちうさ",
  "SAO",
  "ソードアート・オンライン",
  "デッドオアアライブ",
  "五等分の花嫁",
  "閃乱カグラ",
  "ガンダム",
  "葬送のフリーレン",
  "ラブライブ!",
  "ラブライブ",
  "ラブライブ!サンシャイン!!",
  "NIKKE",
  "勝利の女神:NIKKE",
  "グランブルーファンタジー",
  "プリキュア",
  "推しの子",
  "鬼滅の刃",
  "リゼロ",
  "ドラゴンボール",
  "ドラゴンクエスト",
  "崩壊スターレイル",
  "鳴潮",
  "プリコネR",
  "プリンセスコネクト!Re:Dive",
  "美少女戦士セーラームーン",
  "とある科学の超電磁砲",
  "リコリス・リコイル",
  "このすば",
  "ReGLOSS",
  "アルスラーン戦記",
]

type Row = Record<string, string | number | null>

const query = (sql: string): Row[] => {
  const result = spawnSync(
    "npx",
    ["wrangler", "d1", "execute", DATABASE, "--remote", "--json", "--command", sql],
    { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 },
  )
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout)
  }
  const parsed = JSON.parse(result.stdout) as { results: Row[] }[]
  return parsed.flatMap((item) => item.results)
}

const tagRows = query(`
  SELECT t.name AS name,
    SUM(CASE WHEN tc.rating = 0 THEN tc.count ELSE 0 END) AS g,
    SUM(CASE WHEN tc.rating = 1 THEN tc.count ELSE 0 END) AS r
  FROM tag_counts tc JOIN tags t ON t.id = tc.tag_id
  WHERE t.name <> ''
  GROUP BY t.id
  HAVING g >= ${MIN_CHARACTER_WORKS} OR r >= ${MIN_SENSITIVE_TAG_WORKS}
  ORDER BY g + r DESC
  LIMIT 5000
`).map((row) => ({
  name: String(row.name).trim(),
  g: Number(row.g),
  r: Number(row.r),
}))

const characterSet = new Set(CHARACTERS)
const seriesSet = new Set(SERIES)

const kindOf = (name: string) =>
  characterSet.has(name) ? "character" : seriesSet.has(name) ? "series" : "tag"

/** 全角・半角や大文字小文字の違いだけの重複は作品の多い方だけ残す */
const dedupe = <T extends { name: string }>(items: T[]) => {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = item.name.normalize("NFKC").toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const named = dedupe(
  tagRows
    .filter((row) => kindOf(row.name) !== "tag" && row.g >= MIN_CHARACTER_WORKS)
    .sort((a, b) => b.g - a.g),
)
const general = dedupe(
  tagRows
    .filter(
      (row) =>
        kindOf(row.name) === "tag" &&
        row.g >= MIN_TAG_WORKS &&
        !isBlockedHubTag(row.name),
    )
    .sort((a, b) => b.g - a.g),
).slice(0, MAX_TAGS)

const tags = [...named, ...general].map((row) => ({
  name: row.name,
  count: row.g,
  kind: kindOf(row.name),
}))

const sensitiveTags = dedupe(
  tagRows
    .filter(
      (row) =>
        kindOf(row.name) === "tag" &&
        row.r >= MIN_SENSITIVE_TAG_WORKS &&
        isIndexableSensitiveTag(row.name) &&
        !isBlockedHubTag(row.name, { isSensitive: true }),
    )
    .sort((a, b) => b.r - a.r),
)
  .slice(0, MAX_SENSITIVE_TAGS)
  .map((row) => ({ name: row.name, count: row.r }))

const modelRows = query(`
  SELECT m.name AS name,
    SUM(CASE WHEN w.ageLimit = 0 THEN 1 ELSE 0 END) AS g,
    SUM(CASE WHEN w.ageLimit = 1 THEN 1 ELSE 0 END) AS r
  FROM works w INDEXED BY works__idx_service_time
  JOIN ai_models m ON m.post_id = w.service
  WHERE w.is_deleted = 0 AND w.viewMode = 0
    AND (w.adminViewMode IS NULL OR w.adminViewMode = 0)
  GROUP BY m.id
`).map((row) => ({
  name: String(row.name).trim(),
  g: Number(row.g),
  r: Number(row.r),
}))

const models = modelRows
  .filter((row) => row.g >= MIN_MODEL_WORKS && !isBlockedHubModel(row.name))
  .sort((a, b) => b.g - a.g)
  .map((row) => ({ name: row.name, count: row.g }))

const sensitiveModels = modelRows
  .filter((row) => row.r >= MIN_MODEL_WORKS && !isBlockedHubModel(row.name))
  .sort((a, b) => b.r - a.r)
  .map((row) => ({ name: row.name, count: row.r }))

/** 画面（seo-hub-catalog.server.ts の HUB_MIN_*）と同じ基準 */
const HUB_MIN_INDEX_WORKS = 30
const HUB_MIN_PROMPT_WORKS = 6

const API = "https://api.aipictors.com/"

const WORK_FIELDS = "id promptAccessType prompt tagNames user { id }"

const graphqlRequest = async (query: string, variables: unknown) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          // Cloudflare が既定の UA を止めるので付ける
          "user-agent": "Mozilla/5.0 aipictors-seo-hubs-generator",
        },
        body: JSON.stringify({ query, variables }),
      })
      if (response.ok) {
        const json = (await response.json()) as { data?: Record<string, unknown> }
        if (json.data) return json.data
      }
    } catch {
      // 少し待ってやり直す
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
  }
  return null
}

type ApiWork = {
  id: string
  promptAccessType: string
  prompt: string | null
  tagNames: string[]
  user: { id: string } | null
}

const countTagPromptWorks = async (name: string, isSensitive: boolean) => {
  const where = {
    tagNames: [name],
    ratings: isSensitive ? ["R18"] : ["G"],
    hasPrompt: true,
    isPromptPublic: true,
    sort: "DESC",
    isNowCreatedAt: true,
    ...(isSensitive && { isSensitive: true }),
  }
  const data = await graphqlRequest(
    `query($popular: WorksWhereInput, $latest: WorksWhereInput) {
      popular: tagWorks(offset: 0, limit: 64, where: $popular) { ${WORK_FIELDS} }
      latest: tagWorks(offset: 0, limit: 64, where: $latest) { ${WORK_FIELDS} }
    }`,
    {
      popular: { ...where, orderBy: "LIKES_COUNT" },
      latest: { ...where, orderBy: "DATE_CREATED" },
    },
  )
  if (!data) return -1
  const works = new Map<string, ApiWork>()
  for (const work of [
    ...((data.popular as ApiWork[]) ?? []),
    ...((data.latest as ApiWork[]) ?? []),
  ]) {
    works.set(work.id, work)
  }
  return pickHubPromptWorks([...works.values()], { isSensitive }).length
}

const countModelPromptWorks = async (name: string, isSensitive: boolean) => {
  const where = {
    ratings: isSensitive ? ["R18"] : ["G"],
    hasPrompt: true,
    isPromptPublic: true,
    orderBy: "DATE_CREATED",
    sort: "DESC",
    ...(isSensitive && { isSensitive: true }),
  }
  const data = await graphqlRequest(
    `query($search: String!, $where: WorksWhereInput) {
      aiModel(where: { search: $search }) {
        first: works(offset: 0, limit: 64, where: $where) { ${WORK_FIELDS} }
        second: works(offset: 64, limit: 64, where: $where) { ${WORK_FIELDS} }
      }
    }`,
    { search: name, where },
  )
  const model = data?.aiModel as { first: ApiWork[]; second: ApiWork[] } | null
  if (!model) return data ? 0 : -1
  return pickHubPromptWorks([...model.first, ...model.second], { isSensitive })
    .length
}

/** API に負担をかけないように、同時に 4 本まで */
const mapLimit = async <T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
) => {
  const results: R[] = []
  let next = 0
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (next < items.length) {
        const index = next++
        results[index] = await fn(items[index])
      }
    }),
  )
  return results
}

const keepIndexable = async <T extends { name: string; count: number }>(
  label: string,
  items: T[],
  count: (name: string) => Promise<number>,
) => {
  const candidates = items.filter((item) => item.count >= HUB_MIN_INDEX_WORKS)
  const counts = await mapLimit(candidates, 4, (item) => count(item.name))
  // 失敗したもの（混んでいたときのタイムアウトなど）は、少し待って 1 本ずつやり直す
  for (const [index, value] of counts.entries()) {
    if (value >= 0) continue
    await new Promise((resolve) => setTimeout(resolve, 500))
    counts[index] = await count(candidates[index].name)
  }
  const failed = candidates.filter((_, index) => counts[index] < 0)
  if (failed.length > candidates.length * 0.1) {
    throw new Error(`${label}: API の失敗が多すぎる（${failed.length}/${candidates.length}）`)
  }
  // それでも数えられなかったものは残す（画面で数え直し、少なければ noindex になる）
  const kept = candidates.filter(
    (_, index) => counts[index] < 0 || counts[index] >= HUB_MIN_PROMPT_WORKS,
  )
  console.log(
    `${label}: ${kept.length}/${items.length}（数えられなかったもの ${failed.map((item) => item.name).join("・") || "なし"}）`,
  )
  return kept
}

const catalog = {
  generatedAt: new Date().toISOString().slice(0, 10),
  tags: await keepIndexable("tags", tags, (name) => countTagPromptWorks(name, false)),
  sensitiveTags: await keepIndexable("R18 tags", sensitiveTags, (name) =>
    countTagPromptWorks(name, true),
  ),
  models: await keepIndexable("models", models, (name) =>
    countModelPromptWorks(name, false),
  ),
  sensitiveModels: await keepIndexable("R18 models", sensitiveModels, (name) =>
    countModelPromptWorks(name, true),
  ),
}

const outPath = join(import.meta.dir, "../../app/lib/seo-hubs/seo-hub-catalog.json")
writeFileSync(outPath, `${JSON.stringify(catalog, null, 1)}\n`)
console.log(
  `tags ${catalog.tags.length}（キャラ ${catalog.tags.filter((t) => t.kind === "character").length}・作品 ${catalog.tags.filter((t) => t.kind === "series").length}）, R18 tags ${catalog.sensitiveTags.length}, models ${catalog.models.length}, R18 models ${catalog.sensitiveModels.length} → ${outPath}`,
)
