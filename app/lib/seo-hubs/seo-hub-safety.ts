import {
  isFeaturableSensitiveTag,
  isFeaturableSensitiveWork,
  isMinorRelatedTag,
} from "~/utils/sensitive-tag-filter"

/**
 * 呪文まとめ（/prompts・/r/prompts）に載せてよいかの判定
 *
 * まとめは運営が「選んで見せる」ページで、検索結果にも出る。
 * 作品自体は全年齢でも、呪文に未成年を連想させる語や性的な語が入っているものは
 * 例・集計・作品の並びのどれにも使わない（誤判定で失うのは「まとめに出ない」だけなので、迷う語は含める）
 */

const normalize = (text: string) =>
  text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[_\s]+/g, " ")

/** 呪文で未成年を連想させる語（英語は単語の境目で見る） */
const MINOR_PROMPT_PATTERN =
  /\b(?:loli\w*|shota\w*|toddler\w*|child\w*|kids?|underage|preteen|minors?|infant|baby face|little girls?|little boys?|young girls?|young boys?|elementary|middle school|kindergarten\w*|petite body|flat chest\w*|aged? down|(?:[1-9]|1[0-7]) ?(?:yo|years? old|歳|才))\b/

/** 全年齢のまとめで避ける性的な語 */
const EXPLICIT_PROMPT_PATTERN =
  /\b(?:nsfw|nude\w*|naked|nipples?|areola\w*|pussy|penis|sex\w*|cum\w*|vagina\w*|genital\w*|ero\w*|hentai|porn\w*|breasts?|cleavage|underboob|sideboob|panty\w*|panties|pantsu|underwear|lingerie|thong|crotch|ass|butt|thighs?|spread legs|bondage|bdsm|seductive|lewd|topless|bottomless|see-through|wet clothes|groin|cameltoe|upskirt|skirt lift)\b/

/** 日本語の性的な語（タグ名・呪文の両方。部分一致） */
const EXPLICIT_JA_TERMS = [
  "おっぱい",
  "oppai",
  "パンチラ",
  "パンツ",
  "ぱんつ",
  "パンティ",
  "下着",
  "尻",
  "おしり",
  "谷間",
  "たくし上げ",
  "たくしあげ",
  "鼠径",
  "セクシー",
  "sexy",
  "グラビア",
  "ビキニ",
  "ランジェリー",
  "女体",
  "透け",
  "フェチ",
  "エロ",
  "嫌パン",
  "魅惑",
  "裸",
  "露出",
  "緊縛",
  "拘束",
  "ガーター",
  "ハイレグ",
  "腋",
  "ワキ",
  "脇",
  "むちむち",
  "ムチムチ",
  "熟女",
  "人妻",
  "食い込み",
  "胸",
  "ふともも",
  "太もも",
  "生足",
  "美脚",
  "触手",
  "淫",
  "催眠",
  "洗脳",
  "奴隷",
  "首輪",
  "監禁",
  "百合キス",
  "ハーレム",
  "ちっぱい",
  "チッパイ",
  "絶対領域",
  "低身長",
  "サキュバス",
  "nsfw",
]

/** R18 のまとめで、入口の基準（isFeaturableSensitiveTag）に加えて避ける語 */
const SENSITIVE_EXTRA_PATTERN =
  /少年|^妹$|体操着|スク水|ランドセル|^r-?18g?$|^r18$|^sex$/i

/** 「牛乳」「豆乳」を巻き込まないように見る */
const EXPLICIT_JA_PATTERN = /(?:巨|爆|貧|美|微|超|垂れ|下|横|着衣)乳|乳(?:首|輪|房|暖簾)/

const hasExplicitJaTerm = (text: string) =>
  EXPLICIT_JA_PATTERN.test(text) ||
  EXPLICIT_JA_TERMS.some((term) => text.includes(term))

/** 索引に載せない（タグとしての意味が薄い・企画用・AI の総称・複数のタグをまとめて書いたもの） */
const META_TAG_PATTERN =
  /^(?:!|＃|#)|^(?:ai|ai\s|aiイラスト|aiアート|aiart|aiartworks|aiグラビア|ai美少女|ai美女|ai小説|ai漫画|aiラノベ|ai画像文芸部|ai術師|aiサーガ|aiにおまかせ|aiイラストつくろっ)|プロンプト|今日のお題|お題|今日は(?:何|なん)の日|動画|小説|オリジナル(?:マージ)?モデル|novelai|nijijourney|stablediffusion|dalle|dall-e|bingimagecreator|imagecreator|copilotdesigner|chatgpt|gemini|nanobanana|imagefx|hidream|qwenimage|zimageturbo|^zit$|civitai|comfyui|pixai|gpt4v|suno|seaart|企画|特集|まとめ|周年|イベント|利用ok|初リプ|初絡み|繋がりたい|おはよう投稿|^[0-9a-z]{1,2}$/i

/** 未成年キャラクターの作品が多い・名前だけで年齢を連想させるモデル */
const BLOCKED_MODEL_PATTERN = /loli|shota|hentai|^custommodel/i

export function isBlockedHubModel(name: string): boolean {
  return BLOCKED_MODEL_PATTERN.test(name)
}

/**
 * まとめの索引・関連タグに載せないタグ
 * 全年齢: 未成年を連想させる語・性的な語・意味の薄いタグ
 * R18: 既存の R18 の入口と同じ基準（isFeaturableSensitiveTag）＋意味の薄いタグ
 */
export function isBlockedHubTag(
  name: string,
  options: { isSensitive?: boolean } = {},
): boolean {
  const text = normalize(name).trim()
  if (text.length === 0 || text.length > 30) return true
  // 「タグA タグB タグC」のように複数を 1 つに書いたもの
  if (/\s/.test(text) && text.split(" ").length >= 3) return true
  if (/[,、，／/]/.test(text)) return true
  if (META_TAG_PATTERN.test(text)) return true
  if (options.isSensitive) {
    return !isFeaturableSensitiveTag(name) || SENSITIVE_EXTRA_PATTERN.test(text)
  }
  if (isMinorRelatedTag(name)) return true
  return hasExplicitJaTerm(text)
}

/**
 * 呪文を例・集計に使ってよいか
 */
export function isSafeHubPrompt(
  prompt: string,
  options: { isSensitive?: boolean } = {},
): boolean {
  const text = normalize(prompt)
  if (MINOR_PROMPT_PATTERN.test(text)) return false
  if (/(^|[^カ])ロリ|幼女|幼児|子供|こども|小学|中学|女児|ショタ/.test(text)) {
    return false
  }
  if (options.isSensitive) return true
  if (EXPLICIT_PROMPT_PATTERN.test(text)) return false
  return !hasExplicitJaTerm(text)
}

/**
 * 作品をまとめに出してよいか（タグと呪文の両方を見る）
 */
export function isSafeHubWork(
  work: { tagNames?: readonly string[] | null; prompt?: string | null },
  options: { isSensitive?: boolean } = {},
): boolean {
  const tagNames = work.tagNames ?? []
  if (options.isSensitive) {
    if (!isFeaturableSensitiveWork({ tagNames })) return false
  } else if (
    tagNames.some(
      (tag) => isMinorRelatedTag(tag) || hasExplicitJaTerm(normalize(tag)),
    )
  ) {
    return false
  }
  return isSafeHubPrompt(work.prompt ?? "", options)
}
