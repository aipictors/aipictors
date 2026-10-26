import { useBoolean } from "usehooks-ts"
import { Dialog, DialogTrigger } from "~/components/ui/dialog"
import { NegativePromptsDialogContent } from "~/routes/($lang).generation._index/components/negative-prompt-view/negative-prompts-dialog-content"
import { PromptCategoriesDialogContent } from "~/routes/($lang).generation._index/components/prompt-view/prompt-categories-dialog-content"
import { usePromptKeywordSelection } from "~/routes/($lang).generation._index/hooks/use-prompt-keyword-selection"

type Props = {
  type: "prompt" | "negative"
  /**
   * ダイアログを開くボタン
   */
  children: React.ReactNode
}

/**
 * キーワード一覧からプロンプトを選ぶダイアログ（ボタンは呼び出し側で渡す）
 */
export function PromptKeywordsDialogButton(props: Props) {
  const selection = usePromptKeywordSelection(props.type)

  const { value, setValue, setFalse } = useBoolean()

  return (
    <Dialog open={value} onOpenChange={setValue}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      {value && props.type === "prompt" && (
        <PromptCategoriesDialogContent
          selectedPromptIds={selection.selectedIds}
          onClose={setFalse}
          promptCategories={selection.categories}
          onSelect={selection.onSelect}
        />
      )}
      {value && props.type === "negative" && (
        <NegativePromptsDialogContent
          selectedNegativePromptIds={selection.selectedIds}
          onClose={setFalse}
          negativePromptCategories={selection.categories}
          onSelect={selection.onSelect}
        />
      )}
    </Dialog>
  )
}
