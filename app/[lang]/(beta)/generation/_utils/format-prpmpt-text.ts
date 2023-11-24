export const formatPromptText = (text: string) => {
  return text
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length !== 0)
    .join(",")
}
