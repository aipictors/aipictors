import { BookTextIcon, RotateCcwIcon } from "lucide-react"
import { useBoolean } from "usehooks-ts"
import { Button } from "~/components/ui/button"
import { Dialog, DialogTrigger } from "~/components/ui/dialog"
import { Textarea } from "~/components/ui/textarea"
import { useTranslation } from "~/hooks/use-translation"
import { GenerationViewCard } from "~/routes/($lang).generation._index/components/generation-view-card"
import { NegativePromptsDialogContent } from "~/routes/($lang).generation._index/components/negative-prompt-view/negative-prompts-dialog-content"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { getDefaultNegativePrompt } from "~/routes/($lang).generation._index/utils/get-default-negative-prompt"

/**
 * Format prompt text
 * @param text
 */
export function formatPromptTextForKeyWord(text: string) {
  return text
    .split(",")
    .filter((t) => t.length !== 0)
    .join(",")
}

export function GenerationNegativePromptView() {
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

  const resetAction = (
    <Button
      size={"icon"}
      variant={"ghost"}
      title={t("ネガティブを初期値に戻す", "Reset negative prompt")}
      onClick={() => {
        context.updateNegativePrompt(
          getDefaultNegativePrompt(context.config.modelType),
        )
      }}
    >
      <RotateCcwIcon className="h-4 w-4" />
    </Button>
  )

  return (
    <Dialog
      open={value}
      onOpenChange={(isOpen) => {
        if (isOpen) return
        setFalse()
      }}
    >
      <GenerationViewCard
        title={t("ネガティブプロンプト", "Negative Prompts")}
        tooltip={t(
          "生成したくないイラストを英単語で書いてください。初期値は高品質なイラストの生成に役立つ値が入力されています。",
          "Write the English words of the illustrations you don't want to generate. The initial value is set to a value that helps generate high-quality illustrations.",
        )}
        action={
          <>
            {resetAction}
            <DialogTrigger asChild>
              <Button size={"icon"} variant={"ghost"} onClick={setTrue}>
                <BookTextIcon />
              </Button>
            </DialogTrigger>
          </>
        }
      >
        <div className="relative flex h-full flex-col gap-y-2 pb-2 md:px-4 md:pb-4">
          <Textarea
            className="h-full min-h-32 resize-none font-mono md:min-h-16"
            placeholder={t("EasyNegativeなど", "EasyNegative, etc.")}
            value={context.config.negativePromptText}
            onChange={(event) => {
              context.updateNegativePrompt(event.target.value)
            }}
            maxLength={20000}
          />

          {/* モバイルは下部に大きめ導線も出す */}
          <DialogTrigger asChild>
            <Button
              onClick={setTrue}
              variant={"secondary"}
              size={"sm"}
              className="sticky bottom-0 w-full md:hidden"
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
        </div>
      </GenerationViewCard>
    </Dialog>
  )
}
