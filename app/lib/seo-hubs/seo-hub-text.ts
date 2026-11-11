/**
 * 呪文まとめのタイトル・説明文（meta と画面で共通）
 * 集計した数字と語から作るので、ページごとに中身の違う説明になる
 */

type HubTextInput = {
  type: "tag" | "model"
  name: string
  tagKind: "character" | "series" | "tag" | null
  isSensitive: boolean
  worksCount: number
  promptWorksCount: number
  tokens: { content: { token: string }[] }
  models: { name: string }[]
  relatedTags: { name: string }[]
}

const quote = (items: string[]) => items.map((item) => `「${item}」`).join("")

const subjectJa = (data: HubTextInput) =>
  data.type === "model" ? `${data.name}モデル` : data.name

export function buildHubTitle(data: HubTextInput, lang: "ja" | "en") {
  if (lang === "en") {
    return data.type === "model"
      ? `${data.name} prompts & AI art examples`
      : `${data.name} AI art prompts${data.isSensitive ? " (R18)" : ""}`
  }
  if (data.type === "model") {
    return `${data.name}の呪文（プロンプト）まとめ・作例${data.isSensitive ? "（R18）" : ""}`
  }
  return `${data.name}の呪文（プロンプト）まとめ・AIイラスト${data.isSensitive ? "（R18）" : ""}`
}

export function buildHubDescription(data: HubTextInput, lang: "ja" | "en") {
  const words = data.tokens.content.slice(0, 4).map((item) => item.token)
  if (lang === "en") {
    return `Prompts used in ${data.worksCount.toLocaleString()} ${data.isSensitive ? "adult " : ""}AI illustrations of ${data.name} on Aipictors${
      words.length > 0 ? `. Common words: ${words.join(", ")}` : ""
    }. See popular works, models and copy-ready example prompts.`
  }
  const count = data.worksCount.toLocaleString()
  const target = data.isSensitive ? "R18 AIイラスト" : "AIイラスト"
  return `${subjectJa(data)}の${target}${count}件から、よく使われる呪文（プロンプト）・${
    data.type === "model" ? "" : "モデル・"
  }人気作品をまとめました。${
    words.length > 0 ? `${quote(words)}などがよく使われています。` : ""
  }呪文をそのまま試せる例つき。`
}

/**
 * ページ上部の説明（2〜3 文）
 */
export function buildHubIntro(data: HubTextInput, lang: "ja" | "en"): string[] {
  const words = data.tokens.content.slice(0, 5).map((item) => item.token)
  const models = data.models.slice(0, 3).map((item) => item.name)
  const related = data.relatedTags.slice(0, 5).map((item) => item.name)
  if (lang === "en") {
    return [
      `Aipictors has ${data.worksCount.toLocaleString()} ${data.isSensitive ? "adult " : ""}AI illustrations ${
        data.type === "model" ? `made with ${data.name}` : `tagged "${data.name}"`
      }. We counted the public prompts of ${data.promptWorksCount} popular works.`,
      words.length > 0
        ? `Frequent words: ${words.join(", ")}.${models.length > 0 ? ` Models used often: ${models.join(", ")}.` : ""}`
        : "",
    ].filter(Boolean)
  }
  const lines = [
    data.type === "model"
      ? `Aipictorsには${data.name}で作られた${data.isSensitive ? "R18の" : ""}AIイラストが${data.worksCount.toLocaleString()}件投稿されています。呪文を公開している作品${data.promptWorksCount}件の呪文を集計しました。`
      : `Aipictorsには「${data.name}」タグの${data.isSensitive ? "R18の" : ""}AIイラストが${data.worksCount.toLocaleString()}件投稿されています。呪文（プロンプト）を公開している人気作品${data.promptWorksCount}件の呪文を集計しました。`,
  ]
  if (words.length > 0) {
    lines.push(
      `よく使われている語は${quote(words)}${
        models.length > 0 && data.type === "tag"
          ? `、使われたモデルは${quote(models)}などです。`
          : "などです。"
      }`,
    )
  }
  if (data.tagKind === "character") {
    lines.push(
      "キャラクターを描くときは、名前（英語表記が使われることが多い）に髪型・目の色・衣装などの特徴を足すと安定しやすくなります。",
    )
  } else if (related.length > 0) {
    lines.push(`一緒に付けられることが多いタグは${quote(related)}です。`)
  }
  return lines
}
