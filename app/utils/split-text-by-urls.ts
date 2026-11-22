/** 文の中の URL（末尾の句読点・閉じかっこは含めない） */
const URL_PATTERN =
  /(https?:\/\/[^\s<>"'「」『』（）、。]+[^\s<>"'「」『』（）、。.,:;!?()[\]{}])/g

export type TextPart = { type: "text" | "url"; value: string }

/**
 * 文を URL とそれ以外に分ける（説明欄などで URL をリンクにするため）
 */
export const splitTextByUrls = (text: string): TextPart[] => {
  const parts: TextPart[] = []
  let last = 0
  for (const match of text.matchAll(URL_PATTERN)) {
    const start = match.index ?? 0
    if (start > last)
      parts.push({ type: "text", value: text.slice(last, start) })
    parts.push({ type: "url", value: match[0] })
    last = start + match[0].length
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) })
  return parts
}
