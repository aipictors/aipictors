import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"

/**
 * カンマ区切りの空要素を取り除く
 */
function formatPromptText(text: string) {
  return text
    .split(",")
    .filter((t) => t.length !== 0)
    .join(",")
}

/**
 * キーワード一覧からプロンプト（またはネガティブプロンプト）を足し引きする
 */
export function usePromptKeywordSelection(type: "prompt" | "negative") {
  const context = useGenerationContext()

  const isNegative = type === "negative"

  const text = isNegative
    ? context.config.negativePromptText
    : context.config.promptText

  const categories = isNegative
    ? context.negativePromptCategories
    : context.promptCategories

  const categoryPrompts = categories.flatMap((category) => {
    return category.prompts
  })

  const selectedIds = categoryPrompts
    .filter((prompt) => text.indexOf(prompt.words.join(",")) !== -1)
    .map((prompt) => prompt.id)

  const onSelect = (promptId: string) => {
    const formattedText = formatPromptText(text)
    const categoryPrompt = categoryPrompts.find((prompt) => {
      return prompt.id === promptId
    })
    const promptText = categoryPrompt?.words.join(",") ?? ""
    const draftText = formattedText.includes(promptText)
      ? formattedText.replaceAll(promptText, "")
      : [formattedText, promptText].join(",")
    const nextText = formatPromptText(draftText)
    if (isNegative) {
      context.updateNegativePrompt(nextText)
      return
    }
    context.updatePrompt(nextText)
  }

  return { categories, selectedIds, onSelect }
}
