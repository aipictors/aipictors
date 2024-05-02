import { Textarea } from "@/_components/ui/textarea"
import { GenerationViewCard } from "@/routes/($lang).generation._index/_components/generation-view-card"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"
import {} from "@/_components/ui/dialog"

export const GenerationNegativePromptView = () => {
  const context = useGenerationContext()

  const onAddPrompt = (text: string) => {
    if (context.config.promptText.includes(text)) {
      const replacedText = context.config.promptText.replace(text, "")
      const draftText = replacedText
        .split(",")
        .filter((p) => p !== "")
        .join(",")
      context.updatePrompt(draftText)
      return
    }
    const draftText = context.config.promptText
      .split(",")
      .filter((p) => p !== "")
      .concat([text])
      .join(",")
    context.updatePrompt(draftText)
  }

  return (
    <GenerationViewCard
      title={"ネガティブプロンプト"}
      tooltip={
        "生成したくないイラストを英単語で書いてください。初期値は高品質なイラストの生成に役立つ値が入力されています。"
      }
    >
      <div className="flex h-full flex-col gap-y-2 px-4 pb-2 md:pb-4">
        <Textarea
          className="h-full min-h-24 resize-none font-mono md:min-h-40"
          placeholder={"EasyNegativeなど"}
          value={context.config.negativePromptText}
          onChange={(event) => {
            context.updateNegativePrompt(event.target.value)
          }}
        />
      </div>
      {/* <Dialog
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
      </Dialog> */}
    </GenerationViewCard>
  )
}
