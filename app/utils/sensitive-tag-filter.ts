/**
 * R18 側で「おすすめに出さない・検索エンジンに載せない」タグの判定
 *
 * isSensitiveKeyword は「R18 に振り分ける語」の判定で、ガイドライン違反の判定には使えない。
 * ここはタグのおすすめ・人気順の表示と robots の判断に使う。
 * 誤判定で失うのは「おすすめに出ない・検索に出ない」だけなので、迷う語は含める。
 */

const normalizeTag = (tag: string) =>
  tag
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "")
    // ひらがなをカタカナに揃える
    .replace(/[ぁ-ゖ]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 96))

/** 未成年を連想させる語（部分一致。カタカナに揃えた形で書く） */
const MINOR_TERMS = [
  "ヨウジョ",
  "幼女",
  "幼児",
  "幼稚",
  "乳児",
  "女児",
  "男児",
  "児童",
  "園児",
  "保育園",
  "小学",
  "中学",
  "高校生",
  "女子高",
  "女子校生",
  "未成年",
  "未就学",
  "子供",
  "子ドモ",
  "コドモ",
  "キッズ",
  "赤チャン",
  "ショタ",
  "メスガキ",
  "ランドセル",
  "体操服",
  "ブルマ",
  "スク水",
  "スクール水着",
  "セーラー服",
  "学生服",
  "ツルペタ",
  "援交",
  "援助交際",
  "loli",
  "shota",
  "child",
  "underage",
  "preteen",
  "toddler",
  "schoolgirl",
  "schoolboy",
]

/** 短いので完全一致だけで見る語 */
const MINOR_EXACT_TERMS = new Set([
  "jk",
  "jc",
  "js",
  "jy",
  "少女",
  "学生",
  "minor",
  "teen",
  "kid",
  "kids",
])

/** 18 歳未満の年齢（10 歳、17才 など） */
const MINOR_AGE_PATTERN = /(^|[^0-9])([0-9]|1[0-7])(歳|才|サイ)/

/** 実在の人物を題材にしていることを示す語（個人名はコードに書かない） */
const REAL_PERSON_TERMS = [
  "kpop",
  "k-pop",
  "実在",
  "芸能人",
  "女優",
  "俳優",
  "グラドル",
  "アナウンサー",
  "政治家",
  "ディープフェイク",
  "deepfake",
]

/** 同意のない行為を示す語（おすすめには出さない） */
const NON_CONSENT_TERMS = [
  "レイプ",
  "強姦",
  "陵辱",
  "凌辱",
  "輪姦",
  "睡眠姦",
  "盗撮",
  "痴漢",
]

/** 英語は「grape」などを巻き込まないように完全一致で見る */
const NON_CONSENT_EXACT_TERMS = new Set(["rape"])

/** R18G に寄った語（検索エンジンには載せない） */
const R18G_TERMS = [
  "r18g",
  "r-18g",
  "グロテスク",
  "リョナ",
  "猟奇",
  "欠損",
  "四肢切断",
  "切断",
  "死体",
  "内臓",
  "guro",
  "gore",
]

/** 「グロ」は「グローブ」などを巻き込まないように見る */
const R18G_SHORT_PATTERN = /^(エロ)?グロ$/

const includesAny = (text: string, terms: string[]) =>
  terms.some((term) => text.includes(term))

/** 「ロリ」は「カロリー」などを巻き込まないように見る */
const hasLoliTerm = (text: string) => /(^|[^カ])ロリ/.test(text)

/**
 * 未成年を連想させるタグ
 */
export function isMinorRelatedTag(tag: string): boolean {
  const text = normalizeTag(tag)
  return (
    MINOR_EXACT_TERMS.has(text) ||
    hasLoliTerm(text) ||
    MINOR_AGE_PATTERN.test(text) ||
    includesAny(text, MINOR_TERMS)
  )
}

/**
 * 実在の人物を題材にしていることを示すタグ
 */
export function isRealPersonRelatedTag(tag: string): boolean {
  return includesAny(normalizeTag(tag), REAL_PERSON_TERMS)
}

/**
 * R18G に寄ったタグ
 */
export function isR18gRelatedTag(tag: string): boolean {
  const text = normalizeTag(tag)
  return R18G_SHORT_PATTERN.test(text) || includesAny(text, R18G_TERMS)
}

/**
 * R18 のタグページを検索エンジンに載せてよいか
 */
export function isIndexableSensitiveTag(tag: string): boolean {
  return (
    !isMinorRelatedTag(tag) &&
    !isRealPersonRelatedTag(tag) &&
    !isR18gRelatedTag(tag)
  )
}

/**
 * R18 のタグをおすすめ・人気順で出してよいか
 */
export function isSuggestableSensitiveTag(tag: string): boolean {
  return (
    isIndexableSensitiveTag(tag) &&
    !NON_CONSENT_EXACT_TERMS.has(normalizeTag(tag)) &&
    !includesAny(normalizeTag(tag), NON_CONSENT_TERMS)
  )
}

/**
 * 運営が選んで大きく見せる枠（ランキング・殿堂・おすすめなど）で避ける語。
 * 単独では判断できないが、未成年を連想させる作品に付くことが多いもの（部分一致。カタカナに揃えた形で書く）
 */
const FEATURE_EXCLUDED_TERMS = [
  "少女",
  "貧乳",
  "微乳",
  "チッパイ",
  "ペド",
  "young",
  "littlegirl",
]

/**
 * 作品に付いていても問題ないが、R18 の入口にタグ名だけを並べると未成年を連想させる語
 */
const TAG_LINK_EXCLUDED_TERMS = ["女ノ子", "男ノ子", "女子", "男子"]

/**
 * R18 のタグを入口の見出しやカードに出してよいか
 */
export function isFeaturableSensitiveTag(tag: string): boolean {
  return (
    isSuggestableSensitiveTag(tag) &&
    !includesAny(normalizeTag(tag), [
      ...FEATURE_EXCLUDED_TERMS,
      ...TAG_LINK_EXCLUDED_TERMS,
    ])
  )
}

/**
 * R18 の作品を「選んで見せる枠」に出してよいか（時系列の新着・検索には使わない）
 */
export function isFeaturableSensitiveWork(work: {
  tagNames?: readonly string[] | null
}): boolean {
  return (work.tagNames ?? []).every(
    (tag) =>
      isSuggestableSensitiveTag(tag) &&
      !includesAny(normalizeTag(tag), FEATURE_EXCLUDED_TERMS),
  )
}

/**
 * 作品のタグのうち 1 つでも載せられないものがあれば、作品ページも検索エンジンに載せない
 */
export function hasNonIndexableSensitiveTag(tagNames: string[]): boolean {
  return tagNames.some((tagName) => !isIndexableSensitiveTag(tagName))
}
