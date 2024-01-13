"use client"

import { PromptCategoriesQuery } from "@/__generated__/apollo"
import { GenerationEditorCard } from "@/app/[lang]/(beta)/generation/_components/generation-editor-card"
import { PromptCategoriesDialog } from "@/app/[lang]/(beta)/generation/_components/prompt-categories-dialog"
import { formatPromptText } from "@/app/[lang]/(beta)/generation/_utils/format-prpmpt-text"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { BookTextIcon } from "lucide-react"
import { useBoolean } from "usehooks-ts"

type Props = {
  promptText: string
  promptCategories: PromptCategoriesQuery["promptCategories"]
  onChangePromptText(text: string): void
}

export const GenerationEditorPrompt = (props: Props) => {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  const formattedPromptText = formatPromptText(props.promptText)

  const categoryPrompts = props.promptCategories.flatMap((category) => {
    return category.prompts
  })

  const onSelectPromptId = (promptId: string) => {
    const categoryPrompt = categoryPrompts.find((prompt) => {
      return prompt.id === promptId
    })
    const promptText = categoryPrompt?.words.join(",") ?? ""
    const draftPromptText = formattedPromptText.includes(promptText)
      ? formattedPromptText.replaceAll(promptText, "")
      : [formattedPromptText, promptText].join(",")
    const draftFormattedPromptText = formatPromptText(draftPromptText)
    props.onChangePromptText(draftFormattedPromptText)
  }

  const currentPrompts = categoryPrompts.filter((prompt) => {
    return formattedPromptText.includes(prompt.words.join(","))
  })

  const selectedPromptIds = currentPrompts.map((prompt) => prompt.id)

  return (
    <>
      <GenerationEditorCard
        title={"プロンプト"}
        tooltip={"生成したいイラストの要素をキーワードから選んでください。"}
        action={
          <>
            <div className="hidden xl:block">
              <Button size={"sm"} onClick={onOpen}>
                {"キーワード"}
              </Button>
            </div>
            <div className="block xl:hidden">
              <Button size={"icon"} variant={"ghost"} onClick={onOpen}>
                <BookTextIcon />
              </Button>
            </div>
          </>
        }
      >
        <div className="flex flex-col px-2 pb-2 h-full">
          <Textarea
            className="resize-none h-full font-mono"
            placeholder={"プロンプト"}
            value={props.promptText}
            onChange={(event) => {
              props.onChangePromptText(event.target.value)
            }}
          />
        </div>
      </GenerationEditorCard>
      <PromptCategoriesDialog
        selectedPromptIds={selectedPromptIds}
        onClose={onClose}
        isOpen={isOpen}
        promptCategories={props.promptCategories}
        onSelect={onSelectPromptId}
      />
    </>
  )
}
