import { BookTextIcon, ChevronRightIcon, RotateCcwIcon } from "lucide-react"
import { useId, useRef, useState } from "react"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { Button } from "~/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible"
import { Switch } from "~/components/ui/switch"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { PromptKeywordsDialogButton } from "~/routes/($lang).generation._index/components/prompt-view/prompt-keywords-dialog-button"
import { PromptTagTextarea } from "~/routes/($lang).generation._index/components/prompt-view/prompt-tag-textarea"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useObserveMobilePromptCard } from "~/routes/($lang).generation._index/hooks/use-mobile-prompt-card-visibility"
import { getDefaultNegativePrompt } from "~/routes/($lang).generation._index/utils/get-default-negative-prompt"

/**
 * スマホの生成画面でいちばん上に出すプロンプト入力
 * （ネガティブプロンプトは折りたたんでおく）
 */
export function GenerationMobilePromptCard() {
  const context = useGenerationContext()

  const t = useTranslation()

  const promptId = useId()

  const negativePromptId = useId()

  const [isNegativeOpen, setIsNegativeOpen] = useState(false)

  const promptRef = useRef<HTMLTextAreaElement>(null)

  useObserveMobilePromptCard(promptRef)

  const isJapanese = context.config.languageUsedForPrompt === "jp"

  const negativePromptText = context.config.negativePromptText.trim()

  return (
    <section className="rounded-2xl border bg-card p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={promptId} className="font-semibold text-base">
          {isJapanese
            ? t("プロンプト（日本語）", "Prompt (Japanese)")
            : t("プロンプト", "Prompt")}
        </label>
        <div className="flex items-center gap-1">
          <Button
            size={"icon"}
            variant={"ghost"}
            className="size-8 text-muted-foreground"
            aria-label={t("プロンプトをクリア", "Clear prompt")}
            disabled={context.config.promptText.length === 0}
            onClick={() => {
              context.updatePrompt("")
            }}
          >
            <RotateCcwIcon className="size-4" />
          </Button>
          <CrossPlatformTooltip
            text={
              isJapanese
                ? t(
                    "描きたいイラストを日本語の文章で書いてください。AIが英語のプロンプトに変換して生成します。",
                    "Describe the illustration in words. AI converts it into a prompt.",
                  )
                : t(
                    "描きたいイラストの要素を英語のキーワードでカンマ区切りで書いてください。「キーワードから選ぶ」からも追加できます。",
                    "Enter the elements you want as comma-separated keywords.",
                  )
            }
          />
        </div>
      </div>
      <div className="mt-2">
        <PromptTagTextarea
          ref={promptRef}
          id={promptId}
          variant="chips"
          autoResize
          className="max-h-[40vh] overflow-y-auto font-mono text-base leading-6"
          placeholder={
            isJapanese
              ? t(
                  "例: 桜の下で笑う女の子、やわらかい光",
                  "e.g. A girl smiling under cherry blossoms",
                )
              : t(
                  "例: 1girl, smile, cherry blossoms, masterpiece",
                  "e.g. 1girl, smile, cherry blossoms, masterpiece",
                )
          }
          value={context.config.promptText}
          onValueChange={context.updatePrompt}
          allowsKanaQuery={!isJapanese}
          onBlur={() => {
            context.initPromptWithLoraModel()
          }}
          maxLength={20000}
          minHeight="7rem"
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        {isJapanese ? (
          <span />
        ) : (
          <PromptKeywordsDialogButton type="prompt">
            <Button variant={"secondary"} size={"sm"} className="gap-1.5">
              <BookTextIcon className="size-4" />
              {t("キーワードから選ぶ", "Pick keywords")}
            </Button>
          </PromptKeywordsDialogButton>
        )}
        {/* biome-ignore lint/a11y/noLabelWithoutControl: Switch は label の中にある */}
        <label className="flex items-center gap-2 text-muted-foreground text-xs">
          {t("日本語で入力", "Write in Japanese")}
          <Switch
            checked={isJapanese}
            onCheckedChange={(checked) => {
              context.changeLanguageUsedForPrompt(checked ? "jp" : null)
            }}
          />
        </label>
      </div>
      <Collapsible
        open={isNegativeOpen}
        onOpenChange={setIsNegativeOpen}
        className="mt-3 border-t pt-1"
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-2 py-2 text-left"
          >
            <ChevronRightIcon
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                isNegativeOpen && "rotate-90",
              )}
            />
            <span className="shrink-0 font-medium text-sm">
              {t("ネガティブプロンプト", "Negative prompt")}
            </span>
            {!isNegativeOpen && (
              <span className="min-w-0 flex-1 truncate text-muted-foreground text-xs">
                {negativePromptText.length > 0
                  ? negativePromptText
                  : t("なし", "None")}
              </span>
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pb-1">
          <p className="text-muted-foreground text-xs">
            {t(
              "描いてほしくないものを英語で書きます。最初から入っている値は高品質に仕上げるためのものです。",
              "Things you don't want in the image. The default helps quality.",
            )}
          </p>
          <PromptTagTextarea
            id={negativePromptId}
            variant="chips"
            autoResize
            aria-label={t("ネガティブプロンプト", "Negative prompt")}
            className="max-h-[30vh] overflow-y-auto font-mono text-base leading-6"
            placeholder={t("例: EasyNegative", "e.g. EasyNegative")}
            value={context.config.negativePromptText}
            onValueChange={context.updateNegativePrompt}
            maxLength={20000}
            minHeight="4.5rem"
          />
          <div className="flex items-center justify-between gap-2">
            <PromptKeywordsDialogButton type="negative">
              <Button variant={"secondary"} size={"sm"} className="gap-1.5">
                <BookTextIcon className="size-4" />
                {t("キーワードから選ぶ", "Pick keywords")}
              </Button>
            </PromptKeywordsDialogButton>
            <Button
              variant={"ghost"}
              size={"sm"}
              className="gap-1.5 text-muted-foreground"
              onClick={() => {
                context.updateNegativePrompt(
                  getDefaultNegativePrompt(context.config.modelType),
                )
              }}
            >
              <RotateCcwIcon className="size-4" />
              {t("初期値に戻す", "Reset")}
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  )
}
