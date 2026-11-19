import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  ConfigSectionHeader,
  ConfigThumbTile,
  configChipClass,
} from "~/routes/($lang).generation._index/components/config-view/generation-config-parts"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { usePromptKeywordSelection } from "~/routes/($lang).generation._index/hooks/use-prompt-keyword-selection"

/**
 * 画風として出す公式 LoRA のジャンル（API の imageLoraModels.genre）
 * 目・髪などの部分的なものは LoRA の一覧（Model タブ）から選ぶ
 */
const styleGenres = ["絵柄", "全体エフェクト", "背景"]

/**
 * 画風として出すプロンプトのカテゴリ（API の promptCategories.name）
 */
const stylePromptCategoryNames = ["テイスト・構図"]

/**
 * 右パネルの Styles タブ
 * 既にある公式 LoRA（絵柄など）とキーワード（テイスト・構図）をサムネ・チップで選べるようにする。
 * 適用は LoRA の一覧・キーワード一覧と同じ処理（上限・プロンプトへの足し引き）を使う
 */
export function GenerationStylesSection() {
  const t = useTranslation()

  const context = useGenerationContext()

  const keywordSelection = usePromptKeywordSelection("prompt")

  const selectedLoraNames = context.promptLoraModels.map((text) => {
    const [name] = text.split(":")
    return name
  })

  const max = context.availableLoraModelsCount

  const styleLoras = styleGenres.flatMap((genre) =>
    context.imageLoraModels
      .filter((model) => model.genre === genre)
      .map((model) => ({ ...model, genre })),
  )

  const styleCategories = keywordSelection.categories.filter((category) =>
    stylePromptCategoryNames.includes(category.name),
  )

  const onToggleLora = (model: (typeof styleLoras)[number]) => {
    const isSelected = selectedLoraNames.includes(model.name)
    if (!isSelected && context.promptLoraModels.length >= max) {
      toast(
        t(
          `LoRA は ${max} 個まで使えます。どれかを外してから追加してください`,
          `You can use up to ${max} LoRAs. Remove one first.`,
        ),
      )
      return
    }
    context.changeLoraModel(
      model.name,
      typeof model.triggerWord === "string" && model.triggerWord !== ""
        ? model.triggerWord
        : undefined,
    )
  }

  return (
    <div className="flex flex-col gap-y-6">
      {styleCategories.map((category) => (
        <section key={category.id} className="space-y-2.5">
          <ConfigSectionHeader
            title={t("テイスト・構図", "Taste & composition")}
            tooltip={t(
              "選ぶとプロンプトにキーワードを足します。もう一度押すと外します。",
              "Adds keywords to the prompt. Tap again to remove.",
            )}
          />
          <div className="flex flex-wrap gap-1.5">
            {category.prompts.map((prompt) => {
              const isSelected = keywordSelection.selectedIds.includes(
                prompt.id,
              )
              return (
                <button
                  key={prompt.id}
                  type="button"
                  aria-pressed={isSelected}
                  title={prompt.words.join(", ")}
                  onClick={() => keywordSelection.onSelect(prompt.id)}
                  className={configChipClass({
                    isSelected,
                    className: "px-3",
                  })}
                >
                  {prompt.name}
                </button>
              )
            })}
          </div>
        </section>
      ))}

      {styleGenres.map((genre) => {
        const items = styleLoras.filter((model) => model.genre === genre)
        if (items.length === 0) return null
        return (
          <section key={genre} className="space-y-2.5">
            <ConfigSectionHeader
              title={
                genre === "絵柄"
                  ? t("画風", "Art style")
                  : genre === "全体エフェクト"
                    ? t("エフェクト", "Effects")
                    : t("背景", "Background")
              }
              tooltip={t(
                "公式の LoRA です。選ぶと LoRA に追加されます（ウェイトは Model タブで変えられます）。",
                "Official LoRAs. Selecting adds them as a LoRA (adjust weight in the Model tab).",
              )}
              aside={
                <span
                  className={cn(
                    "tabular-nums",
                    selectedLoraNames.length >= max &&
                      "font-semibold text-foreground",
                  )}
                >
                  LoRA {selectedLoraNames.length} / {max}
                </span>
              }
            />
            <div className="grid grid-cols-3 gap-2">
              {items.map((model) => (
                <ConfigThumbTile
                  key={model.id}
                  imageUrl={model.thumbnailImageURL || null}
                  label={model.description || model.name}
                  title={`${model.name}${model.description ? `: ${model.description}` : ""}`}
                  isSelected={selectedLoraNames.includes(model.name)}
                  onClick={() => onToggleLora(model)}
                />
              ))}
            </div>
          </section>
        )
      })}

      {styleLoras.length === 0 && styleCategories.length === 0 && (
        <p className="text-muted-foreground text-sm">
          {t("画風を読み込めませんでした", "Could not load styles")}
        </p>
      )}
    </div>
  )
}
