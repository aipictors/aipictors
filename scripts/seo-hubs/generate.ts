/**
 * 呪文まとめ（/prompts・/r/prompts）の索引に載せるタグ・モデルを、本番 D1 の集計から作る
 *
 *   set -a; . ~/.config/aipictors/cloudflare.env; set +a
 *   bun scripts/seo-hubs/generate.ts
 *
 * 出力: app/lib/seo-hubs/seo-hub-catalog.json（コミットしてデプロイ）
 * - タグは tag_counts（年齢区分ごとの作品数を持つ集計済みの表）を読むだけなので軽い（約 120 万行の読み取り）
 * - モデルは works を service ごとに数える（約 80 万行）。月に 1 回くらい作り直せば十分
 * 画面の表示時には D1 を読まない（この JSON を同梱する）
 */
import { spawnSync } from "node:child_process"
import { writeFileSync } from "node:fs"
import { join } from "node:path"
import {
  isBlockedHubTag,
  isBlockedHubModel,
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

const catalog = {
  generatedAt: new Date().toISOString().slice(0, 10),
  tags,
  sensitiveTags,
  models,
  sensitiveModels,
}

const outPath = join(import.meta.dir, "../../app/lib/seo-hubs/seo-hub-catalog.json")
writeFileSync(outPath, `${JSON.stringify(catalog, null, 1)}\n`)
console.log(
  `tags ${tags.length}（キャラ ${tags.filter((t) => t.kind === "character").length}・作品 ${tags.filter((t) => t.kind === "series").length}）, R18 tags ${sensitiveTags.length}, models ${models.length}, R18 models ${sensitiveModels.length} → ${outPath}`,
)
