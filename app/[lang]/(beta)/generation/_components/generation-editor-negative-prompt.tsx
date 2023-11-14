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
      <div className="flex-1 p-1" style={{ height: "100%" }}>
        <div className="space-y-0" style={{ height: "100%" }}>
          <Textarea
            className="p-2 border-radius-none resize-none border-none h-100"
            placeholder={"EasyNegativeなど"}
            value={props.promptText}
            onChange={(event) => {
              props.onChangePromptText(event.target.value)
            }}
          />
          <div className="wrap p-2">
            <Button
              className="size-xs border-radius-full"
              onClick={() => {
                onAddPrompt("+bad-hands-5")
              }}
            >
              {"+bad-hands-5"}
            </Button>
            <Button
              className="size-xs border-radius-full"
              onClick={() => {
                onAddPrompt("+badhandv4")
              }}
            >
              {"+badhandv4"}
            </Button>
            <Button
              className="size-xs border-radius-full"
              onClick={() => {
                onAddPrompt("+bad_prompt_version2")
              }}
            >
              {"+bad_prompt_version2"}
            </Button>
          </div>
        </div>
      </div>
    </GenerationEditorCard>
  )
}
