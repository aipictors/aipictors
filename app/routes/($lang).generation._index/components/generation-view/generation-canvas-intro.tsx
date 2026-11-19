import { BoxIcon, PaletteIcon, SlidersHorizontalIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { ConfigThumbTile } from "~/routes/($lang).generation._index/components/config-view/generation-config-parts"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useGenerationPanelTab } from "~/routes/($lang).generation._index/hooks/use-generation-panel-tab"
import { useUserModelSelection } from "~/routes/($lang).generation._index/hooks/use-user-model-selection"

/**
 * 中央の見出しとおすすめ（生成する前の入り口）
 * おすすめのモデルは公式モデルの先頭から（選ぶと既存のモデル切り替えを使う）
 */
export function GenerationCanvasIntro() {
  const t = useTranslation()

  const context = useGenerationContext()

  const [, setPanelTab] = useGenerationPanelTab()

  const userModelSelection = useUserModelSelection()

  const models = context.imageModels.slice(0, 6)

  const chipClassName =
    "flex h-9 items-center gap-1.5 rounded-full border bg-background px-3.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

  return (
    <div className="space-y-5">
      <h2 className="text-center font-bold text-2xl tracking-tight">
        {t("どんなイラストを描きますか？", "What would you like to draw?")}
      </h2>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          className={chipClassName}
          onClick={() => setPanelTab("styles")}
        >
          <PaletteIcon className="size-4" />
          {t("おすすめの画風", "Popular styles")}
        </button>
        <button
          type="button"
          className={chipClassName}
          onClick={() => setPanelTab("model")}
        >
          <BoxIcon className="size-4" />
          {t("モデルを選ぶ", "Choose a model")}
        </button>
        <button
          type="button"
          className={chipClassName}
          onClick={() => setPanelTab("settings")}
        >
          <SlidersHorizontalIcon className="size-4" />
          {t("サイズ・枚数", "Size & count")}
        </button>
      </div>
      {models.length > 0 && (
        <section className="mx-auto max-w-2xl space-y-2">
          <p className="font-semibold text-muted-foreground text-xs">
            {t("公式モデル", "Official models")}
          </p>
          <div className="grid grid-cols-6 gap-3">
            {models.map((model) => (
              <ConfigThumbTile
                key={model.id}
                imageUrl={model.thumbnailImageURL}
                label={model.displayName ?? model.name}
                isSelected={
                  userModelSelection.checkpoint === null &&
                  context.config.modelId === model.id
                }
                onClick={() => {
                  // モデルライブラリで公式モデルを選んだときと同じ処理
                  if (userModelSelection.checkpoint) {
                    userModelSelection.clearCheckpoint({ restore: false })
                  }
                  context.updateModelId(model.id, model.type)
                  setPanelTab("model")
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
