/**
 * Format prompt text
 * @param text
 */
export const formatPromptText = (text: string) => {
  return text
    .split(",")
    .filter((t) => t.length !== 0)
    .map((t) => t.trim())
    .join(",")
}
