import {
  BanIcon,
  BookTextIcon,
  CheckIcon,
  ImagePlusIcon,
  LanguagesIcon,
  Maximize2Icon,
  PencilLineIcon,
  PlusIcon,
  RotateCcwIcon,
} from "lucide-react"
import { Suspense, useRef, useState } from "react"
import {
  LazyDrawer,
  LazyDrawerClose,
  LazyDrawerContent,
  LazyDrawerDescription,
  LazyDrawerTitle,
} from "~/components/lazy-drawer"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Switch } from "~/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { PromptKeywordsDialogButton } from "~/routes/($lang).generation._index/components/prompt-view/prompt-keywords-dialog-button"
import { PromptTagTextarea } from "~/routes/($lang).generation._index/components/prompt-view/prompt-tag-textarea"
import { useGenerationMobileDock } from "~/routes/($lang).generation._index/contexts/generation-mobile-dock-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useIsMobilePromptCardVisible } from "~/routes/($lang).generation._index/hooks/use-mobile-prompt-card-visibility"
import { getDefaultNegativePrompt } from "~/routes/($lang).generation._index/utils/get-default-negative-prompt"

/**
 * スマホの生成ボタンの上に出すプロンプト欄
 * タップすると下からシートが開いて大きく編集できる
 */
export function GenerationMobilePromptComposer(props: {
  /**
   * 下に固定の入力欄（チャットのような 2 行の欄。押すと大きく編集する。左に＋のメニュー）
   */
  variant?: "dock"
}) {
  const dock = useGenerationMobileDock()

  const context = useGenerationContext()

  const t = useTranslation()

  const [isOpen, setIsOpen] = useState(false)

  const [hasOpened, setHasOpened] = useState(false)

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

  const openEditor = () => {
    setTab("prompt")
    setHasOpened(true)
    setIsOpen(true)
  }

  return (
    <>
      {props.variant === "dock" && (
        <div className="flex min-w-0 items-end gap-1 rounded-[22px] border border-input bg-background p-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={t("その他の操作", "More")}
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
              >
                <PlusIcon className="size-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-60">
              <DropdownMenuItem
                onSelect={() => {
                  context.changeLanguageUsedForPrompt(isJapanese ? null : "jp")
                }}
              >
                <LanguagesIcon className="mr-2 size-4" />
                {t("日本語で入力", "Write in Japanese")}
                {isJapanese && <CheckIcon className="ml-auto size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => dock?.setSheet("settings")}>
                <ImagePlusIcon className="mr-2 size-4" />
                {t("画像から生成・ControlNet", "Image to image · ControlNet")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  setTab("negative")
                  setHasOpened(true)
                  setIsOpen(true)
                }}
              >
                <BanIcon className="mr-2 size-4" />
                {t("ネガティブプロンプト", "Negative prompt")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={context.config.promptText.length === 0}
                onSelect={() => context.updatePrompt("")}
              >
                <RotateCcwIcon className="mr-2 size-4" />
                {t("プロンプトをクリア", "Clear prompt")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* その場で入力する欄（1〜5 行で伸びる）。タグの候補は欄の下に横並びで出す。
              案内文は1行に収める（折り返すと1行の高さの欄に2行目だけが見えていた） */}
          <div data-dock-prompt className="min-w-0 flex-1 py-0.5">
            <PromptTagTextarea
              variant="chips"
              autoResize
              minHeight="40px"
              rows={1}
              aria-label={
                isJapanese
                  ? t("プロンプト（日本語）", "Prompt (Japanese)")
                  : t("プロンプト", "Prompt")
              }
              value={context.config.promptText}
              onValueChange={context.updatePrompt}
              allowsKanaQuery={!isJapanese}
              onFocus={() => dock?.setSheet(null)}
              onBlur={() => context.initPromptWithLoraModel()}
              maxLength={20000}
              placeholder={
                isJapanese
                  ? t("日本語で書く", "Describe it")
                  : t("描きたいもの", "Keywords")
              }
              className="max-h-[7.75rem] min-h-10 resize-none overflow-y-auto border-0 bg-transparent px-1 py-2 text-base leading-6 shadow-none placeholder:truncate focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-label={t("大きく編集", "Expand")}
            onClick={openEditor}
            className="flex size-11 shrink-0 items-center justify-center self-start rounded-full text-muted-foreground active:bg-muted"
          >
            <Maximize2Icon className="size-4" />
          </button>
        </div>
      )}
      {props.variant !== "dock" && !isPromptCardVisible && (
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="flex h-11 w-full items-center gap-2 rounded-full border border-input bg-background px-4 text-left shadow-sm"
          onClick={() => {
            setTab("prompt")
            setHasOpened(true)
            setIsOpen(true)
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
      )}
      {hasOpened && (
        <Suspense fallback={null}>
          <LazyDrawer
            open={isOpen}
            onOpenChange={(open) => {
              setIsOpen(open)
              if (!open) {
                context.initPromptWithLoraModel()
              }
            }}
            shouldScaleBackground={false}
          >
            <LazyDrawerContent
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
                  <LazyDrawerTitle className="text-base">
                    {t("プロンプトを編集", "Edit prompt")}
                  </LazyDrawerTitle>
                  <LazyDrawerClose asChild>
                    <Button size={"sm"} className="px-5">
                      {t("完了", "Done")}
                    </Button>
                  </LazyDrawerClose>
                </div>
                <LazyDrawerDescription className="sr-only">
                  {t(
                    "プロンプトとネガティブプロンプトを編集できます",
                    "Edit the prompt and the negative prompt",
                  )}
                </LazyDrawerDescription>
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
                    allowsKanaQuery={isNegative || !isJapanese}
                    maxLength={20000}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  {isNegative || !isJapanese ? (
                    <PromptKeywordsDialogButton type={tab}>
                      <Button
                        variant={"secondary"}
                        size={"sm"}
                        className="gap-1.5"
                      >
                        <BookTextIcon className="size-4" />
                        {t("キーワードから選ぶ", "Pick keywords")}
                      </Button>
                    </PromptKeywordsDialogButton>
                  ) : (
                    <span />
                  )}
                  {!isNegative && (
                    // biome-ignore lint/a11y/noLabelWithoutControl: Switch は label の中にある
                    <label className="ml-auto flex items-center gap-2 whitespace-nowrap text-muted-foreground text-xs">
                      {t("日本語", "Japanese")}
                      <Switch
                        checked={isJapanese}
                        onCheckedChange={(checked) => {
                          context.changeLanguageUsedForPrompt(
                            checked ? "jp" : null,
                          )
                        }}
                      />
                    </label>
                  )}
                  <Button
                    variant={"ghost"}
                    size={"sm"}
                    className="gap-1.5 text-muted-foreground"
                    onClick={onReset}
                  >
                    <RotateCcwIcon className="size-4" />
                    {isNegative
                      ? t("初期値に戻す", "Reset")
                      : t("クリア", "Clear")}
                  </Button>
                </div>
              </div>
            </LazyDrawerContent>
          </LazyDrawer>
        </Suspense>
      )}
    </>
  )
}
