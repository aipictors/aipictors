/**
 * ヘルプ内の検索（ブラウザの中だけで絞り込む。サーバーや外部の API は使わない）
 * 全角・半角、大文字・小文字、カタカナ・ひらがなの違いを無視し、空白で区切った語がすべて含まれるものを残す
 */
export const normalizeHelpSearchText = (text: string) =>
  text
    .normalize("NFKC")
    .toLowerCase()
    // カタカナをひらがなに
    .replace(/[ァ-ヶ]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0x60),
    )

export const toHelpSearchTokens = (query: string) =>
  normalizeHelpSearchText(query).split(/\s+/).filter(Boolean)

export const matchesHelpSearch = (
  tokens: string[],
  texts: Array<string | undefined>,
) => {
  if (tokens.length === 0) return true
  const haystack = normalizeHelpSearchText(texts.filter(Boolean).join("\n"))
  return tokens.every((token) => haystack.includes(token))
}
