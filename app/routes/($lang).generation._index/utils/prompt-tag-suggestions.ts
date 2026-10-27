/**
 * プロンプト入力のタグ候補（Danbooru のタグと件数）
 */
export type PromptTag = {
  /** タグ名（例: test_tube） */
  name: string
  /** 件数 */
  count: number
  /** 0 一般 / 1 絵師 / 3 作品 / 4 キャラクター / 5 メタ */
  type: number
  /** 別名 */
  aliases: string[]
}

export type PromptTagSuggestion = PromptTag & {
  /** 別名で当たったときの別名 */
  matchedAlias: string | null
}

export type PromptToken = {
  /** 置き換える範囲の先頭（括弧や空白の後ろ） */
  start: number
  /** 置き換える範囲の終わり */
  end: number
  /** 入力中の文字 */
  query: string
}

const TAG_DICTIONARY_URL = "/generation/danbooru-tags.tsv"

let dictionaryPromise: Promise<PromptTag[]> | null = null

/**
 * タグの TSV を読む（1 行 = タグ名<TAB>件数<TAB>種類<TAB>別名）
 */
export function parsePromptTagDictionary(text: string): PromptTag[] {
  const tags: PromptTag[] = []
  for (const line of text.split("\n")) {
    if (line.length === 0) continue
    const [name, count, type, aliases] = line.split("\t")
    if (!name) continue
    tags.push({
      name,
      count: Number(count) || 0,
      type: Number(type) || 0,
      aliases: aliases ? aliases.split(",") : [],
    })
  }
  return tags
}

/**
 * タグの辞書を読み込む（初回だけ取得して使い回す）
 */
export function loadPromptTagDictionary(): Promise<PromptTag[]> {
  if (dictionaryPromise !== null) return dictionaryPromise
  dictionaryPromise = fetch(TAG_DICTIONARY_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response.text()
    })
    .then(parsePromptTagDictionary)
    .catch((error) => {
      // 失敗したら次のフォーカスでもう一度試す
      dictionaryPromise = null
      throw error
    })
  return dictionaryPromise
}

const SEPARATORS = [",", "\n", "、", "，"]

const OPENING_BRACKETS = /^[\s([{<]*/

/**
 * カーソル位置で入力中の単語（カンマ区切り）を取り出す
 */
export function findPromptToken(text: string, cursor: number): PromptToken {
  let start = cursor
  while (start > 0 && !SEPARATORS.includes(text[start - 1])) {
    start--
  }
  let end = cursor
  while (end < text.length && !SEPARATORS.includes(text[end])) {
    // カーソルより後ろは単語の続き（英数字など）だけ置き換える
    if (!/[\w\-']/.test(text[end])) break
    end++
  }
  // 「(」「[」や空白は残して、その後ろから置き換える
  const head = text.slice(start, cursor)
  const prefix = head.match(OPENING_BRACKETS)?.[0] ?? ""
  start += prefix.length
  return {
    start,
    end,
    query: text.slice(start, cursor),
  }
}

/**
 * 検索用に揃える（小文字・空白は _・括弧のエスケープを外す）
 */
export function normalizeTagQuery(text: string) {
  return text.trim().toLowerCase().replace(/\\/g, "").replace(/\s+/g, "_")
}

/**
 * 入力中の文字に合うタグを件数の多い順に探す
 * 1. タグ名の先頭が一致 2. タグ名の途中の単語の先頭が一致 3. 別名の先頭が一致
 */
export function searchPromptTags(
  tags: PromptTag[],
  query: string,
  limit = 8,
): PromptTagSuggestion[] {
  const q = normalizeTagQuery(query)
  // 英数字を含まない（日本語の文章など）・短すぎるときは出さない
  if (q.length < 2 || !/[a-z0-9]/.test(q) || !/^[\x20-\x7e]+$/.test(q)) {
    return []
  }
  // 重みの書き方（例: tag:1.2）を書いている途中なら出さない
  if (/:[\d.]*$/.test(q)) return []

  const prefixMatches: PromptTagSuggestion[] = []
  const wordMatches: PromptTagSuggestion[] = []
  const aliasMatches: PromptTagSuggestion[] = []

  // 性的なタグは、はっきり打ち込んだとき（5 文字以上）だけ出す
  const allowsExplicit = q.length >= 5

  // 辞書は件数の多い順に並んでいる
  for (const tag of tags) {
    if (prefixMatches.length >= limit) break
    if (!allowsExplicit && EXPLICIT_TAG_PATTERN.test(tag.name)) continue
    if (tag.name.startsWith(q)) {
      prefixMatches.push({ ...tag, matchedAlias: null })
      continue
    }
    if (wordMatches.length < limit && isWordPrefixMatch(tag.name, q)) {
      wordMatches.push({ ...tag, matchedAlias: null })
      continue
    }
    if (aliasMatches.length < limit) {
      const alias = tag.aliases.find((a) => a.startsWith(q))
      if (alias !== undefined) {
        aliasMatches.push({ ...tag, matchedAlias: alias })
      }
    }
  }

  return [...prefixMatches, ...wordMatches, ...aliasMatches].slice(0, limit)
}

/**
 * 候補の先頭に出したくない性的なタグ
 */
const EXPLICIT_TAG_PATTERN =
  /(^|_)(sex|penis|testicle|testicles|vagina|pussy|clitoris|nipples?|areolae?|anus|anal|cum|cumdrip|ejaculation|erection|fellatio|cunnilingus|paizuri|masturbation|orgasm|rape|bondage|bdsm|nude|naked|topless|bottomless|pubic|genitals?|futanari|condom|dildo|vibrator|tentacle_sex|ahegao|lactation|bukkake|gangbang|handjob|footjob|blowjob|creampie|nsfw|hentai|uncensored|censored|mosaic_censoring|bar_censor|testicle_sucking|ballsack|cameltoe|spread_legs|spread_pussy)(_|$)/

function isWordPrefixMatch(name: string, q: string) {
  let index = name.indexOf(q, 1)
  while (index !== -1) {
    const before = name[index - 1]
    if (before === "_" || before === "(") return true
    index = name.indexOf(q, index + 1)
  }
  return false
}

/**
 * プロンプトに入れる形にする（_ は空白、括弧はエスケープ）
 * 顔文字（^_^ など）はそのまま
 */
export function formatTagForPrompt(name: string) {
  const isEmoticon = name.length <= 3 || !/[a-z]{2}/i.test(name)
  const text = isEmoticon ? name : name.replace(/_/g, " ")
  return text.replace(/([()])/g, "\\$1")
}

/**
 * 表示用のタグ名（_ は空白）
 */
export function formatTagForDisplay(name: string) {
  const isEmoticon = name.length <= 3 || !/[a-z]{2}/i.test(name)
  return isEmoticon ? name : name.replace(/_/g, " ")
}

/**
 * 件数を短く（8780 → 8.78k）
 */
export function formatTagCount(count: number) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(2)}M`
  if (count >= 1000)
    return `${(count / 1000).toFixed(count >= 100_000 ? 0 : 2)}k`
  return String(count)
}

/**
 * 入力中の単語を選んだタグに置き換える
 * @returns 新しい文字列と、カーソルを置く位置
 */
export function applyPromptTag(
  text: string,
  token: PromptToken,
  tagText: string,
): { text: string; cursor: number } {
  const before = text.slice(0, token.start)
  let after = text.slice(token.end)
  // 閉じ括弧や重み（例: ":1.2)"）は残す
  const closing = after.match(/^[^,\n]*?[)\]}>]+/)?.[0] ?? ""
  const keepsClosing = closing.length > 0 && /^[\s:\d.)\]}>]*$/.test(closing)
  const closingText = keepsClosing ? closing : ""
  after = after.slice(closingText.length)
  // 後ろに続くカンマと空白はまとめる
  after = after.replace(/^\s*,\s*/, "")
  const inserted = `${tagText}${closingText}, `
  const nextText = `${before}${inserted}${after}`
  return { text: nextText, cursor: before.length + inserted.length }
}
