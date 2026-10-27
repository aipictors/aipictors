import {
  ArrowUpIcon,
  BookTextIcon,
  CheckIcon,
  ImagePlusIcon,
  LanguagesIcon,
  Maximize2Icon,
  PlusIcon,
  RotateCcwIcon,
  TagsIcon,
  XIcon,
} from "lucide-react"
import { useRef, useState } from "react"
import { useLocalStorage } from "usehooks-ts"
import { CropImageField } from "~/components/crop-image-field"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { PromptKeywordsDialogButton } from "~/routes/($lang).generation._index/components/prompt-view/prompt-keywords-dialog-button"
import {
  PromptTagTextarea,
  TAG_SUGGESTIONS_STORAGE_KEY,
} from "~/routes/($lang).generation._index/components/prompt-view/prompt-tag-textarea"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { parseGenerationSize } from "~/routes/($lang).generation._index/types/generation-size"
import { requestGenerationSubmit } from "~/routes/($lang).generation._index/utils/request-generation-submit"

const isMac = () => {
  if (typeof navigator === "undefined") return false
  return /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
}

/**
 * PC のプロンプト入力欄
 * 画像の追加・タグ候補・拡大編集・キーワード選択・生成をひとまとめにする
 */
export function GenerationPromptComposer() {
  const context = useGenerationContext()

  const t = useTranslation()

  const [isExpanded, setIsExpanded] = useState(false)

  const [isTagSuggestionsEnabled, setIsTagSuggestionsEnabled] = useLocalStorage(
    TAG_SUGGESTIONS_STORAGE_KEY,
    true,
  )

  const expandedTextareaRef = useRef<HTMLTextAreaElement>(null)

  const isJapanese = context.config.languageUsedForPrompt === "jp"

  const size = parseGenerationSize(context.config.sizeType)

  const i2iImage = context.config.i2iImageBase64

  const placeholder = isJapanese
    ? t(
        "作りたいイラストを日本語で書いてください（例: 桜の下で笑う女の子、やわらかい光）",
        "Describe the illustration in words",
      )
    : t(
        "作りたいイラストの要素をキーワードで入力（例: 1girl, smile, cherry blossoms）",
        "Enter keywords (e.g. 1girl, smile, cherry blossoms)",
      )

  const shortcutLabel = isMac() ? "⌘ + Enter" : "Ctrl + Enter"

  const onBlur = () => {
    context.initPromptWithLoraModel()
  }

  const textarea = (
    <PromptTagTextarea
      aria-label={t("プロンプト", "Prompt")}
      value={context.config.promptText}
      onValueChange={context.updatePrompt}
      allowsKanaQuery={!isJapanese}
      onBlur={onBlur}
      onSubmitShortcut={requestGenerationSubmit}
      autoResize
      minHeight="88px"
      maxLength={20000}
      placeholder={placeholder}
      className="max-h-[38vh] min-h-[88px] resize-none overflow-y-auto border-0 bg-transparent p-0 font-mono text-sm leading-6 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
    />
  )

  return (
    <div className="rounded-2xl border bg-background shadow-sm transition-shadow focus-within:border-fuchsia-400/70 focus-within:shadow-md">
      <div className="flex gap-3 p-3 pb-1">
        {/* 画像から生成の画像 */}
        <div className="relative shrink-0">
          <CropImageField
            isHidePreviewImage={true}
            cropWidth={size.width}
            cropHeight={size.height}
            onDeleteImage={() => context.changeI2iImageBase64("")}
            onCrop={context.changeI2iImageBase64}
          >
            <button
              type="button"
              title={t(
                "画像から生成する画像を追加",
                "Add an image to generate from",
              )}
              aria-label={t("画像を追加", "Add image")}
              className={cn(
                "flex size-16 items-center justify-center overflow-hidden rounded-xl text-muted-foreground transition-colors hover:bg-muted/60",
                i2iImage
                  ? "border bg-muted"
                  : "border border-muted-foreground/40 border-dashed",
              )}
            >
              {i2iImage ? (
                <img src={i2iImage} alt="" className="size-full object-cover" />
              ) : (
                <ImagePlusIcon className="size-5" />
              )}
            </button>
          </CropImageField>
          {i2iImage && (
            <button
              type="button"
              aria-label={t("画像を外す", "Remove image")}
              className="-top-1.5 -right-1.5 absolute flex size-5 items-center justify-center rounded-full bg-foreground text-background shadow"
              onClick={() => context.changeI2iImageBase64("")}
            >
              <XIcon className="size-3" />
            </button>
          )}
        </div>

        <div className="min-w-0 flex-1 pt-1">{textarea}</div>

        <Button
          variant={"ghost"}
          size={"icon"}
          className="size-8 shrink-0 text-muted-foreground"
          title={t("大きく編集", "Expand")}
          aria-label={t("大きく編集", "Expand")}
          onClick={() => setIsExpanded(true)}
        >
          <Maximize2Icon className="size-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 px-2 pb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={"outline"}
              size={"icon"}
              className="size-9 rounded-full"
              aria-label={t("その他の操作", "More")}
            >
              <PlusIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem
              onSelect={() =>
                setIsTagSuggestionsEnabled(!isTagSuggestionsEnabled)
              }
            >
              <TagsIcon className="mr-2 size-4" />
              {t("タグ候補を出す", "Tag suggestions")}
              {isTagSuggestionsEnabled && (
                <CheckIcon className="ml-auto size-4" />
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                context.updatePrompt("")
              }}
            >
              <RotateCcwIcon className="mr-2 size-4" />
              {t("プロンプトをクリア", "Clear prompt")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant={"ghost"}
          size={"sm"}
          aria-pressed={isJapanese}
          title={t(
            "日本語の文章からAIがプロンプトを作ります",
            "AI writes the prompt from your Japanese text",
          )}
          className={cn(
            "h-9 gap-1.5 rounded-full",
            isJapanese
              ? "bg-fuchsia-500/10 text-fuchsia-600 hover:bg-fuchsia-500/15 dark:text-fuchsia-300"
              : "text-muted-foreground",
          )}
          onClick={() => {
            context.changeLanguageUsedForPrompt(isJapanese ? null : "jp")
          }}
        >
          <LanguagesIcon className="size-4" />
          {t("日本語で生成", "Japanese")}
        </Button>

        {!isJapanese && (
          <PromptKeywordsDialogButton type="prompt">
            <Button
              variant={"ghost"}
              size={"sm"}
              className="h-9 gap-1.5 rounded-full text-muted-foreground"
            >
              <BookTextIcon className="size-4" />
              {t("キーワード", "Keywords")}
            </Button>
          </PromptKeywordsDialogButton>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-muted-foreground text-xs xl:inline">
            {shortcutLabel}
          </span>
          <span className="text-muted-foreground text-xs tabular-nums">
            {context.config.promptText.length.toLocaleString()}
          </span>
          <button
            type="button"
            title={t(`生成（${shortcutLabel}）`, `Generate (${shortcutLabel})`)}
            aria-label={t("生成", "Generate")}
            className="flex size-9 items-center justify-center rounded-full bg-linear-to-tr from-fuchsia-600 to-purple-500 text-white shadow transition-opacity hover:opacity-85 active:scale-95"
            onClick={requestGenerationSubmit}
          >
            <ArrowUpIcon className="size-4" />
          </button>
        </div>
      </div>

      {/* 大きく編集 */}
      <Dialog
        open={isExpanded}
        onOpenChange={(open) => {
          setIsExpanded(open)
          if (!open) onBlur()
        }}
      >
        <DialogContent
          className="flex h-[80vh] max-w-3xl flex-col gap-3"
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            const element = expandedTextareaRef.current
            if (element === null) return
            element.focus()
            element.setSelectionRange(
              element.value.length,
              element.value.length,
            )
          }}
        >
          <DialogTitle>{t("プロンプト", "Prompt")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("プロンプトを大きく編集します", "Edit the prompt")}
          </DialogDescription>
          <div className="min-h-0 flex-1 [&>div]:h-full">
            <PromptTagTextarea
              ref={expandedTextareaRef}
              aria-label={t("プロンプト", "Prompt")}
              value={context.config.promptText}
              onValueChange={context.updatePrompt}
              allowsKanaQuery={!isJapanese}
              onSubmitShortcut={() => {
                setIsExpanded(false)
                requestGenerationSubmit()
              }}
              maxLength={20000}
              placeholder={placeholder}
              className="h-full resize-none font-mono text-sm leading-6"
              suggestionsClassName="top-auto bottom-2 left-2"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-xs">
              {t(
                `Tab / Enter で候補を入力・${shortcutLabel} で生成`,
                `Tab / Enter to insert a tag, ${shortcutLabel} to generate`,
              )}
            </span>
            <Button onClick={() => setIsExpanded(false)}>
              {t("完了", "Done")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
