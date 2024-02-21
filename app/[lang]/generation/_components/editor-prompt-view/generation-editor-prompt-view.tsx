"use client"

import { PromptCategoriesDialogContents } from "@/app/[lang]/generation/_components/editor-prompt-view/prompt-categories-dialog-contents"
import { GenerationEditorCard } from "@/app/[lang]/generation/_components/generation-editor-card"
import { useGenerationEditor } from "@/app/[lang]/generation/_hooks/use-generation-editor"
import { formatPromptText } from "@/app/[lang]/generation/_utils/format-prompt-text"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { PromptCategoriesQuery } from "@/graphql/__generated__/graphql"
import { BookTextIcon } from "lucide-react"

type Props = {
  promptCategories: PromptCategoriesQuery["promptCategories"]
}

export const GenerationEditorPromptView = (props: Props) => {
  const editor = useGenerationEditor()

  const formattedPromptText = formatPromptText(editor.context.promptText)

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
    editor.updatePrompt(draftFormattedPromptText)
  }

  const currentPrompts = categoryPrompts.filter((prompt) => {
    return formattedPromptText.includes(prompt.words.join(","))
  })

  const selectedPromptIds = currentPrompts.map((prompt) => prompt.id)

  const onOpen = () => {}
  const onClose = () => {}

  return (
    <>
      <GenerationEditorCard
        title={"プロンプト"}
        tooltip={"生成したいイラストの要素をキーワードから選んでください。"}
        action={
          <>
            <div className="hidden xl:block">
              <Button variant={"secondary"} size={"sm"} onClick={onOpen}>
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
        <div className="flex flex-col px-4 pb-4 h-full gap-y-2">
          <Textarea
            className="resize-none h-full font-mono min-h-40"
            placeholder={"プロンプト"}
            value={editor.context.promptText}
            onChange={(event) => {
              editor.updatePrompt(event.target.value)
            }}
            onBlur={() => {
              editor.initPromptWithLoraModel()
            }}
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant={"secondary"} size={"sm"} className="w-full">
                {"キーワードから選ぶ"}
              </Button>
            </DialogTrigger>
            <PromptCategoriesDialogContents
              selectedPromptIds={selectedPromptIds}
              onClose={onClose}
              promptCategories={props.promptCategories}
              onSelect={onSelectPromptId}
            />
          </Dialog>
        </div>
      </GenerationEditorCard>
    </>
  )
}
