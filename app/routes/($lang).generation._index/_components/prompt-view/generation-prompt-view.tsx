import { Button } from "@/_components/ui/button"
import { Dialog, DialogTrigger } from "@/_components/ui/dialog"
import { Textarea } from "@/_components/ui/textarea"
import { GenerationViewCard } from "@/routes/($lang).generation._index/_components/generation-view-card"
import { PromptCategoriesDialogContent } from "@/routes/($lang).generation._index/_components/prompt-view/prompt-categories-dialog-content"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"
import { BookTextIcon } from "lucide-react"
import { useBoolean } from "usehooks-ts"

/**
 * Format prompt text
 * @param text
 * @returns
 */
export const formatPromptTextForKeyWord = (text: string) => {
  return text
    .split(",")
    .filter((t) => t.length !== 0)
    .join(",")
}

export const GenerationPromptView = () => {
  const context = useGenerationContext()

  const formattedPromptText = formatPromptTextForKeyWord(
    context.config.promptText,
  )

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
    const draftFormattedPromptText = formatPromptTextForKeyWord(draftPromptText)
    context.updatePrompt(draftFormattedPromptText)
  }

  const currentPrompts = categoryPrompts.filter((prompt) => {
    return context.config.promptText.indexOf(prompt.words.join(",")) !== -1
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
        <div className="relative flex h-full flex-col gap-y-2 px-4 pb-1 md:pb-4">
          <Textarea
            className="h-full min-h-16 resize-none font-mono md:min-h-16"
            placeholder={
              "生成したいイラストの要素をキーワードで入力してください。例: 1 girl, masterpiece"
            }
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
                className="sticky bottom-0 w-full"
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
