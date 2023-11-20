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
          <Button size={"sm"} onClick={onOpen}>
            {"キーワード"}
          </Button>
        }
      >
        <div className="flex flex-col px-2 pb-2 h-full">
          <Textarea
            className="resize-none h-full"
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
