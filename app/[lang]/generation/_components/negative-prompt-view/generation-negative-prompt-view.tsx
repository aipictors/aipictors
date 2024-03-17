"use client"

import { GenerationViewCard } from "@/app/[lang]/generation/_components/generation-view-card"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { Textarea } from "@/components/ui/textarea"

export const GenerationNegativePromptView = () => {
  const context = useGenerationContext()

  const onAddPrompt = (text: string) => {
    if (context.config.promptText.includes(text)) {
      const replacedText = context.config.promptText.replace(text, "")
      const draftText = replacedText
        .split(",")
        .filter((p) => p !== "")
        .join(",")
      context.updatePrompt(draftText)
      return
    }
    const draftText = context.config.promptText
      .split(",")
      .filter((p) => p !== "")
      .concat([text])
      .join(",")
    context.updatePrompt(draftText)
  }

  return (
    <GenerationViewCard
      title={"ネガティブプロンプト"}
      tooltip={
        "生成したくないイラストを英単語で書いてください。初期値は高品質なイラストの生成に役立つ値が入力されています。"
      }
    >
      <div className="flex h-full flex-col gap-y-2 px-4 pb-4">
        <Textarea
          className="h-full min-h-40 resize-none font-mono"
          placeholder={"EasyNegativeなど"}
          value={context.config.negativePromptText}
          onChange={(event) => {
            context.updateNegativePrompt(event.target.value)
          }}
        />
      </div>
    </GenerationViewCard>
  )
}
