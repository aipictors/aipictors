"use client"

import { GenerationEditorCard } from "@/app/[lang]/generation/_components/generation-editor-card"
import { useGenerationEditor } from "@/app/[lang]/generation/_hooks/use-generation-editor"
import { Button } from "@/components/ui/button"
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
          value={editor.context.promptText}
          onChange={(event) => {
            editor.updatePrompt(event.target.value)
          }}
        />
        <div className="hidden xl:flex flex-wrap gap-2">
          <Button
            className="font-mono"
            size={"sm"}
            variant={"secondary"}
            onClick={() => {
              onAddPrompt("+bad-hands-5")
            }}
          >
            {"+bad-hands-5"}
          </Button>
          <Button
            className="font-mono"
            size={"sm"}
            variant={"secondary"}
            onClick={() => {
              onAddPrompt("+badhandv4")
            }}
          >
            {"+badhandv4"}
          </Button>
          <Button
            className="font-mono"
            size={"sm"}
            variant={"secondary"}
            onClick={() => {
              onAddPrompt("+bad_prompt_version2")
            }}
          >
            {"+bad_prompt"}
          </Button>
        </div>
      </div>
    </GenerationEditorCard>
  )
}
