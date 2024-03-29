/**
 * Format prompt text
 * @param text
 * @returns
 */
export const formatPromptText = (text: string) => {
  return text
    .split(",")
    .filter((t) => t.length !== 0)
    .join(",")
}
