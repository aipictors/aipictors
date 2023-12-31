"use client"

import { GenerationEditorCard } from "@/app/[lang]/(beta)/generation/_components/generation-editor-card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type Props = {
  promptText: string
  onChangePromptText(prompt: string): void
}

export const GenerationEditorNegativePrompt = (props: Props) => {
  const onAddPrompt = (text: string) => {
    if (props.promptText.includes(text)) {
      const replacedText = props.promptText.replace(text, "")
      const draftText = replacedText
        .split(",")
        .filter((p) => p !== "")
        .join(",")
      props.onChangePromptText(draftText)
      return
    }
    const draftText = props.promptText
      .split(",")
      .filter((p) => p !== "")
      .concat([text])
      .join(",")
    props.onChangePromptText(draftText)
  }

  return (
    <GenerationEditorCard
      title={"ネガティブ"}
      tooltip={
        "生成したくないイラストを英単語で書いてください。初期値は高品質なイラストの生成に役立つ値が入力されています。"
      }
    >
      <div className="flex flex-col px-2 pb-2 gap-y-2 h-full">
        <Textarea
          className="resize-none h-full font-mono"
          placeholder={"EasyNegativeなど"}
          value={props.promptText}
          onChange={(event) => {
            props.onChangePromptText(event.target.value)
          }}
        />
        <div className="hidden xl:flex flex-wrap gap-2">
          <Button
            className="font-mono"
            size={"sm"}
            onClick={() => {
              onAddPrompt("+bad-hands-5")
            }}
          >
            {"+bad-hands-5"}
          </Button>
          <Button
            className="font-mono"
            size={"sm"}
            onClick={() => {
              onAddPrompt("+badhandv4")
            }}
          >
            {"+badhandv4"}
          </Button>
          <Button
            className="font-mono"
            size={"sm"}
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
