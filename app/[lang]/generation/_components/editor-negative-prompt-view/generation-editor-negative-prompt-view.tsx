"use client"

import { GenerationEditorCard } from "@/app/[lang]/generation/_components/generation-editor-card"
import { useGenerationEditor } from "@/app/[lang]/generation/_hooks/use-generation-editor"
import { Textarea } from "@/components/ui/textarea"

export const GenerationEditorNegativePromptView = () => {
  const editor = useGenerationEditor()

  const onAddPrompt = (text: string) => {
    if (editor.context.promptText.includes(text)) {
      const replacedText = editor.context.promptText.replace(text, "")
      const draftText = replacedText
        .split(",")
        .filter((p) => p !== "")
        .join(",")
      editor.updatePrompt(draftText)
      return
    }
    const draftText = editor.context.promptText
      .split(",")
      .filter((p) => p !== "")
      .concat([text])
      .join(",")
    editor.updatePrompt(draftText)
  }

  return (
    <GenerationEditorCard
      title={"ネガティブプロンプト"}
      tooltip={
        "生成したくないイラストを英単語で書いてください。初期値は高品質なイラストの生成に役立つ値が入力されています。"
      }
    >
      <div className="flex flex-col px-4 pb-4 h-full gap-y-2">
        <Textarea
          className="resize-none h-full font-mono min-h-40"
          placeholder={"EasyNegativeなど"}
          value={editor.context.negativePromptText}
          onChange={(event) => {
            editor.updateNegativePrompt(event.target.value)
          }}
        />
      </div>
    </GenerationEditorCard>
  )
}
