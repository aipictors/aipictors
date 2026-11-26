/**
 * 作品ページの説明文（meta description）。
 * 検索結果で何の作品か分かるように、必ず「モデル・タグ・作者・種類」の 1 文から始め、作者の説明はその後ろに付ける
 * （以前は説明が 40 文字以上あると説明だけで、タグや作者名が検索結果に出なかった）
 */

/** 説明文に入れるタグの数（多いと作者の説明が入らなくなる） */
const DESCRIPTION_TAG_LIMIT = 3

/** 説明文の最大文字数（検索結果に出るのは 120 文字前後。長すぎる分は切る） */
const DESCRIPTION_MAX_LENGTH = 200

type WorkDescriptionSource = {
  title: string
  userName: string | null
  model: string | null
  tagNames: string[]
  style: string | null
  type: string | null
  isPromptPublic: boolean
  description: string | null
}

function toStyleLabel(work: WorkDescriptionSource, lang: "ja" | "en") {
  if (work.type === "VIDEO") return lang === "ja" ? "AI動画" : "AI video"
  if (work.type === "NOVEL" || work.type === "COLUMN") {
    return lang === "ja" ? "AI小説" : "AI story"
  }
  if (work.style === "REAL") return lang === "ja" ? "AIフォト" : "AI photo"
  return lang === "ja" ? "AIイラスト" : "AI illustration"
}

function truncate(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim()
  return normalized.length > DESCRIPTION_MAX_LENGTH
    ? `${normalized.slice(0, DESCRIPTION_MAX_LENGTH - 1)}…`
    : normalized
}

export function buildWorkMetaDescription(
  work: WorkDescriptionSource,
  lang: "ja" | "en",
): string {
  const tags = work.tagNames
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .slice(0, DESCRIPTION_TAG_LIMIT)
  const model = work.model?.trim() || null
  const own = (work.description ?? "").trim()
  const style = toStyleLabel(work, lang)

  if (lang === "en") {
    const lead = `"${work.title}" is an ${style}${
      work.userName ? ` by ${work.userName}` : ""
    }${model ? ` made with ${model}` : ""}${
      tags.length > 0 ? `, tagged ${tags.join(", ")}` : ""
    } on Aipictors.${work.isPromptPublic ? " The prompt is public." : ""}`
    return truncate(own ? `${lead} ${own}` : lead)
  }

  const lead = `この作品は${model ? `「${model}」で生成された` : ""}${
    tags.length > 0 ? `「${tags.join("」「")}」タグがついた` : ""
  }${work.userName ? `「${work.userName}」さんの` : ""}${style}です。${
    work.isPromptPublic ? "プロンプト（呪文）も公開されています。" : ""
  }`
  return truncate(own ? `${lead}${own}` : lead)
}
