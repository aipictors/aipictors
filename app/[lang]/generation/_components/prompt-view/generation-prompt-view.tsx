"use client"

import { GenerationViewCard } from "@/app/[lang]/generation/_components/generation-view-card"
import { PromptCategoriesDialogContent } from "@/app/[lang]/generation/_components/prompt-view/prompt-categories-dialog-content"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { formatPromptText } from "@/app/[lang]/generation/_utils/format-prompt-text"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { BookTextIcon } from "lucide-react"
import { useBoolean } from "usehooks-ts"

export const GenerationPromptView = () => {
  const context = useGenerationContext()

  const formattedPromptText = formatPromptText(context.config.promptText)

  const categoryPrompts = context.promptCategories.flatMap((category) => {
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
    context.updatePrompt(draftFormattedPromptText)
  }

  const currentPrompts = categoryPrompts.filter((prompt) => {
    const formattedTextParts = formattedPromptText.split(",")
    return prompt.words.some((word) => formattedTextParts.includes(word))
  })

  const selectedPromptIds = currentPrompts.map((prompt) => prompt.id)

  const { value, setTrue, setFalse } = useBoolean()

  return (
    <>
      <GenerationViewCard
        title={"プロンプト"}
        tooltip={"生成したいイラストの要素をキーワードから選んでください。"}
        action={
          <>
            <div className="hidden xl:block">
              <Button variant={"secondary"} size={"sm"}>
                {"キーワード"}
              </Button>
            </div>
            <div className="block xl:hidden">
              <Button size={"icon"} variant={"ghost"}>
                <BookTextIcon />
              </Button>
            </div>
          </>
        }
      >
        <div className="flex h-full flex-col gap-y-2 px-4 pb-1 md:pb-4">
          <Textarea
            className="h-full min-h-72 resize-none font-mono md:min-h-40"
            placeholder={"プロンプト"}
            value={context.config.promptText}
            onChange={(event) => {
              context.updatePrompt(event.target.value)
            }}
            onBlur={() => {
              context.initPromptWithLoraModel()
            }}
          />
          <Dialog
            open={value}
            onOpenChange={(isOpen) => {
              if (isOpen) return
              setFalse()
            }}
          >
            <DialogTrigger asChild>
              <Button
                onClick={setTrue}
                variant={"secondary"}
                size={"sm"}
                className="w-full"
              >
                {"キーワードから選ぶ"}
              </Button>
            </DialogTrigger>
            <PromptCategoriesDialogContent
              selectedPromptIds={selectedPromptIds}
              onClose={setFalse}
              promptCategories={context.promptCategories}
              onSelect={onSelectPromptId}
            />
          </Dialog>
        </div>
      </GenerationViewCard>
    </>
  )
}
