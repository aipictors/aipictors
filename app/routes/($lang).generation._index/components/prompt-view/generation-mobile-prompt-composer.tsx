import { BookTextIcon, PencilLineIcon, RotateCcwIcon } from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { PromptKeywordsDialogButton } from "~/routes/($lang).generation._index/components/prompt-view/prompt-keywords-dialog-button"
import { PromptTagTextarea } from "~/routes/($lang).generation._index/components/prompt-view/prompt-tag-textarea"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useIsMobilePromptCardVisible } from "~/routes/($lang).generation._index/hooks/use-mobile-prompt-card-visibility"
import { getDefaultNegativePrompt } from "~/routes/($lang).generation._index/utils/get-default-negative-prompt"

/**
 * スマホの生成ボタンの上に出すプロンプト欄
 * タップすると下からシートが開いて大きく編集できる
 */
export function GenerationMobilePromptComposer() {
  const context = useGenerationContext()

  const t = useTranslation()

  const [isOpen, setIsOpen] = useState(false)

  const [tab, setTab] = useState<"prompt" | "negative">("prompt")

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /**
   * 上のプロンプト入力欄が見えている間は、同じ欄が2つ並ばないようにしまっておく
   */
  const isPromptCardVisible = useIsMobilePromptCardVisible()

  const isJapanese = context.config.languageUsedForPrompt === "jp"

  const isNegative = tab === "negative"

  const promptText = context.config.promptText.trim()

  const value = isNegative
    ? context.config.negativePromptText
    : context.config.promptText

  const onChange = (text: string) => {
    if (isNegative) {
      context.updateNegativePrompt(text)
      return
    }
    context.updatePrompt(text)
  }

  const onReset = () => {
    if (isNegative) {
      context.updateNegativePrompt(
        getDefaultNegativePrompt(context.config.modelType),
      )
      return
    }
    context.updatePrompt("")
  }

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) {
          context.initPromptWithLoraModel()
        }
      }}
      shouldScaleBackground={false}
    >
      {!isPromptCardVisible && (
        <DrawerTrigger asChild>
          <button
            type="button"
            className="flex h-11 w-full items-center gap-2 rounded-full border border-input bg-background px-4 text-left shadow-sm"
            onClick={() => {
              setTab("prompt")
            }}
          >
            <PencilLineIcon className="size-4 shrink-0 text-muted-foreground" />
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-sm",
                promptText.length === 0 && "text-muted-foreground",
              )}
            >
              {promptText.length > 0
                ? promptText
                : t("プロンプトを入力", "Enter a prompt")}
            </span>
          </button>
        </DrawerTrigger>
      )}
      <DrawerContent
        className="h-[85dvh] max-h-[85dvh] pb-[env(safe-area-inset-bottom)]"
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          const textarea = textareaRef.current
          if (textarea === null) return
          textarea.focus({ preventScroll: true })
          textarea.setSelectionRange(
            textarea.value.length,
            textarea.value.length,
          )
        }}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pt-3 pb-3">
          <div className="flex items-center justify-between gap-2">
            <DrawerTitle className="text-base">
              {t("プロンプトを編集", "Edit prompt")}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button size={"sm"} className="px-5">
                {t("完了", "Done")}
              </Button>
            </DrawerClose>
          </div>
          <DrawerDescription className="sr-only">
            {t(
              "プロンプトとネガティブプロンプトを編集できます",
              "Edit the prompt and the negative prompt",
            )}
          </DrawerDescription>
          <Tabs
            value={tab}
            onValueChange={(next) => {
              setTab(next === "negative" ? "negative" : "prompt")
            }}
          >
            <TabsList className="w-full">
              <TabsTrigger value="prompt" className="w-full">
                {t("プロンプト", "Prompt")}
              </TabsTrigger>
              <TabsTrigger value="negative" className="w-full">
                {t("ネガティブ", "Negative")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex min-h-32 flex-1 flex-col [&>div]:flex-1 [&_textarea]:flex-1">
            <PromptTagTextarea
              ref={textareaRef}
              variant="chips"
              aria-label={
                isNegative
                  ? t("ネガティブプロンプト", "Negative prompt")
                  : t("プロンプト", "Prompt")
              }
              className="min-h-32 flex-1 resize-none font-mono text-base leading-6"
              placeholder={
                isNegative
                  ? t("例: EasyNegative", "e.g. EasyNegative")
                  : isJapanese
                    ? t(
                        "例: 桜の下で笑う女の子、やわらかい光",
                        "e.g. A girl smiling under cherry blossoms",
                      )
                    : t(
                        "例: 1girl, smile, cherry blossoms, masterpiece",
                        "e.g. 1girl, smile, cherry blossoms, masterpiece",
                      )
              }
              value={value}
              onValueChange={onChange}
              maxLength={20000}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            {isNegative || !isJapanese ? (
              <PromptKeywordsDialogButton type={tab}>
                <Button variant={"secondary"} size={"sm"} className="gap-1.5">
                  <BookTextIcon className="size-4" />
                  {t("キーワードから選ぶ", "Pick keywords")}
                </Button>
              </PromptKeywordsDialogButton>
            ) : (
              <span className="text-muted-foreground text-xs">
                {t("日本語で入力中", "Writing in Japanese")}
              </span>
            )}
            <Button
              variant={"ghost"}
              size={"sm"}
              className="gap-1.5 text-muted-foreground"
              onClick={onReset}
            >
              <RotateCcwIcon className="size-4" />
              {isNegative ? t("初期値に戻す", "Reset") : t("クリア", "Clear")}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
