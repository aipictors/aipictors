/**
 * Format prompt text
 * @param text
 */
export function formatPromptText(text: string) {
  return text
    .split(",")
    .filter((t) => t.length !== 0)
    .map((t) => t.trim())
    .join(",")
}

/**
 * カンマ区切りの空要素だけを取り除く（空白は残す）
 */
export function removeEmptyPromptParts(text: string) {
  return text
    .split(",")
    .filter((t) => t.length !== 0)
    .join(",")
}
