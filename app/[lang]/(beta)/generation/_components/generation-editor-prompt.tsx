"use client"

import { PromptCategoriesQuery } from "@/__generated__/apollo"
import { GenerationEditorCard } from "@/app/[lang]/(beta)/generation/_components/generation-editor-card"
import { PromptCategoriesDialog } from "@/app/[lang]/(beta)/generation/_components/prompt-categories-dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useBoolean } from "usehooks-ts"

type Props = {
  promptText: string
  promptCategories: PromptCategoriesQuery["promptCategories"]
  onChangePromptText(text: string): void
}

export const GenerationEditorPrompt = (props: Props) => {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  const onSelectPromptId = (promptId: string) => {}

  return (
    <>
      <GenerationEditorCard
        title={"プロンプト"}
        tooltip={"生成したいイラストの要素をキーワードから選んでください。"}
        action={
          <Button className="border-radius-full size-sm" onClick={onOpen}>
            {"キーワード"}
          </Button>
        }
      >
        <div className="flex-1 p-1" style={{ height: "100%" }}>
          <Textarea
            className="p-2 border-radius-none resize-none border-none h-100 border-bottom-md"
            placeholder={"プロンプト"}
            value={props.promptText}
            onChange={(event) => {
              props.onChangePromptText(event.target.value)
            }}
          />
        </div>
      </GenerationEditorCard>
      <PromptCategoriesDialog
        onClose={onClose}
        isOpen={isOpen}
        promptCategories={props.promptCategories}
        onSelect={onSelectPromptId}
      />
    </>
  )
}
