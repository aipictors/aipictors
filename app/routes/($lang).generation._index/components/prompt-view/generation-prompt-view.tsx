import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { Button } from "~/components/ui/button"
import { Dialog, DialogTrigger } from "~/components/ui/dialog"
import { Textarea } from "~/components/ui/textarea"
import { GenerationViewCard } from "~/routes/($lang).generation._index/components/generation-view-card"
import { PromptCategoriesDialogContent } from "~/routes/($lang).generation._index/components/prompt-view/prompt-categories-dialog-content"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { BookTextIcon } from "lucide-react"
import { useBoolean } from "usehooks-ts"
import { useTranslation } from "~/hooks/use-translation"

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

export function GenerationPromptView() {
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

  const t = useTranslation()

  return (
    <>
      <GenerationViewCard
        title={
          context.config.languageUsedForPrompt === null
            ? t("プロンプト", "Prompts")
            : t("生成内容（日本語）", "Text For Generation")
        }
        tooltip={
          context.config.languageUsedForPrompt === null
            ? t(
                "生成したいイラストの要素をキーワードから選んでください。",
                "Select the elements you want to generate from the keywords",
              )
            : t(
                "生成したいイラストを言葉で入力してください。文章からAIでプロンプトを自動生成します。",
                "Please enter the illustration you want to generate in words.",
              )
        }
        action={
          <>
            <div className="hidden xl:block">
              <Button variant={"secondary"} size={"sm"}>
                {t("キーワード", "Keywords")}
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
        <div className="relative flex h-full flex-col gap-y-2 pb-1 md:px-4 md:pb-4">
          <Textarea
            className="hidden h-full min-h-48 resize-none font-mono md:block md:min-h-16"
            placeholder={
              context.config.languageUsedForPrompt === null
                ? t(
                    "生成したいイラストの要素をキーワードで入力してください。例: 1 girl, masterpiece",
                    "Please enter the elements you want to generate in keywords",
                  )
                : t(
                    "生成したいイラストを言葉で入力してください。例: かわいい女の子",
                    "Please enter the illustration you want to generate in words. Example: cute girl",
                  )
            }
            value={context.config.promptText}
            onChange={(event) => {
              context.updatePrompt(event.target.value)
            }}
            onBlur={() => {
              context.initPromptWithLoraModel()
            }}
          />
          <AutoResizeTextarea
            className="block h-full min-h-48 resize-none font-mono md:hidden md:min-h-16"
            placeholder={
              context.config.languageUsedForPrompt === null
                ? t(
                    "生成キーワード例: 1 girl, masterpiece",
                    "Please enter the elements you want to generate in keywords",
                  )
                : t(
                    "生成キーワード例: 1 女の子, 名作",
                    "Please input words you want to generate",
                  )
            }
            value={context.config.promptText}
            onChange={(event) => {
              context.updatePrompt(event.target.value)
            }}
            onBlur={() => {
              context.initPromptWithLoraModel()
            }}
            minHeight="120px"
          />
          {context.config.languageUsedForPrompt === null && (
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
              <PromptCategoriesDialogContent
                selectedPromptIds={selectedPromptIds}
                onClose={setFalse}
                promptCategories={context.promptCategories}
                onSelect={onSelectPromptId}
              />
            </Dialog>
          )}
        </div>
      </GenerationViewCard>
    </>
  )
}
