/** 絵の内容ではないタグ（生成ツール名など）はプロンプトに入れない */
const ignoredTags = new Set([
  "ai",
  "aiart",
  "ai art",
  "aiイラスト",
  "ai illustration",
  "aipictors",
  "stablediffusion",
  "stable diffusion",
  "novelai",
  "nijijourney",
  "midjourney",
  "dalle",
  "dall-e",
  "sdxl",
  "flux",
  "illustrious",
  "pony",
])

type CategoryPrompt = {
  name: string
  words: string[]
}

/**
 * 作品のタグからプロンプトの下書きを作る
 * プロンプトが公開されていない作品を「参照生成」したときに使う
 * 日本語のタグはプロンプト辞書（名前が一致するもの）で英語に置き換え、英語のタグはそのまま使う
 * @param tagNames 作品のタグ
 * @param categoryPrompts 生成画面のプロンプト辞書
 */
export function workTagsToPrompt(
  tagNames: string[],
  categoryPrompts: CategoryPrompt[],
): string {
  const dictionary = new Map<string, string[]>()
  for (const prompt of categoryPrompts) {
    const key = prompt.name.trim().toLowerCase()
    if (key.length === 0 || prompt.words.length === 0) continue
    if (!dictionary.has(key)) dictionary.set(key, prompt.words)
  }

  const words: string[] = []
  for (const tagName of tagNames) {
    const tag = tagName.trim()
    if (tag.length === 0 || ignoredTags.has(tag.toLowerCase())) continue
    const found = dictionary.get(tag.toLowerCase())
    if (found) {
      words.push(...found)
      continue
    }
    // 英数字と記号だけのタグ（例: 1girl, blue hair）はそのままプロンプトとして使える
    if (/^[\x20-\x7e]+$/.test(tag)) {
      words.push(tag.toLowerCase().replaceAll("_", " "))
    }
  }

  const unique: string[] = []
  for (const word of words) {
    const value = word.trim()
    if (value.length === 0 || unique.includes(value)) continue
    unique.push(value)
  }
  return unique.join(", ")
}
