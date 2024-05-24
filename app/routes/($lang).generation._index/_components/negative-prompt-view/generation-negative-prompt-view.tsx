import { Textarea } from "@/_components/ui/textarea"
import { GenerationViewCard } from "@/routes/($lang).generation._index/_components/generation-view-card"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"
import { Dialog, DialogTrigger } from "@/_components/ui/dialog"
import { Button } from "@/_components/ui/button"
import { NegativePromptsDialogContent } from "@/routes/($lang).generation._index/_components/negative-prompt-view/negative-prompts-dialog-content"
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

export const GenerationNegativePromptView = () => {
  const context = useGenerationContext()

  const formattedNegativePromptText = formatPromptTextForKeyWord(
    context.config.negativePromptText,
  )

  const categoryNegativePrompts = context.negativePromptCategories.flatMap(
    (category) => {
      return category.prompts
    },
  )

  const onSelectPromptId = (promptId: string) => {
    const categoryNegativePrompt = categoryNegativePrompts.find((prompt) => {
      return prompt.id === promptId
    })
    const promptText = categoryNegativePrompt?.words.join(",") ?? ""
    const draftPromptText = formattedNegativePromptText.includes(promptText)
      ? formattedNegativePromptText.replaceAll(promptText, "")
      : [formattedNegativePromptText, promptText].join(",")
    const draftFormattedNegativePromptText =
      formatPromptTextForKeyWord(draftPromptText)
    context.updateNegativePrompt(draftFormattedNegativePromptText)
  }

  const currentNegativePrompts = categoryNegativePrompts.filter((prompt) => {
    return (
      context.config.negativePromptText.indexOf(prompt.words.join(",")) !== -1
    )
  })

  const selectedNegativePromptIds = currentNegativePrompts.map(
    (prompt) => prompt.id,
  )

  const { value, setTrue, setFalse } = useBoolean()

  return (
    <GenerationViewCard
      title={"ネガティブプロンプト"}
      tooltip={
        "生成したくないイラストを英単語で書いてください。初期値は高品質なイラストの生成に役立つ値が入力されています。"
      }
    >
      <div className="relative flex h-full flex-col gap-y-2 px-4 pb-2 md:pb-4">
        <Textarea
          className="h-full min-h-32 resize-none font-mono md:min-h-16"
          placeholder={"EasyNegativeなど"}
          value={context.config.negativePromptText}
          onChange={(event) => {
            context.updateNegativePrompt(event.target.value)
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
          <NegativePromptsDialogContent
            selectedNegativePromptIds={selectedNegativePromptIds}
            onClose={setFalse}
            negativePromptCategories={context.negativePromptCategories}
            onSelect={onSelectPromptId}
          />
        </Dialog>
      </div>
    </GenerationViewCard>
  )
}
