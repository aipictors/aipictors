import { Textarea } from "~/components/ui/textarea"
import { GenerationViewCard } from "~/routes/($lang).generation._index/components/generation-view-card"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { Dialog, DialogTrigger } from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { NegativePromptsDialogContent } from "~/routes/($lang).generation._index/components/negative-prompt-view/negative-prompts-dialog-content"
import { useBoolean } from "usehooks-ts"
import { useTranslation } from "~/hooks/use-translation"

/**
 * Format prompt text
 * @param text
 */
export function formatPromptTextForKeyWord (text: string) {
  return text
    .split(",")
    .filter((t) => t.length !== 0)
    .join(",")
}

export function GenerationDemoNegativePromptView () {
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

  const t = useTranslation()

  return (
    <GenerationViewCard
      title={t("つくりたくない画像", "Negative Prompts")}
      tooltip={t(
        "うまくつくれないときに、つくりたくない画像の言葉を入れてください",
        "Write the English words of the illustrations you don't want to generate. The initial value is set to a value that helps generate high-quality illustrations.",
      )}
    >
      <div className="relative flex h-full flex-col gap-y-2 pb-2 md:px-4 md:pb-4">
        <Textarea
          className="h-full min-h-32 resize-none font-mono md:min-h-16"
          placeholder={t("背景 など", "EasyNegative, etc.")}
          value={context.config.negativePromptText}
          onChange={(event) => {
            context.updateNegativePrompt(event.target.value)
          }}
          maxLength={20000}
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
              {t("キーワードから選ぶ", "Select from keywords")}
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
