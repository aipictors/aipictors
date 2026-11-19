import {
  BoxIcon,
  ImagesIcon,
  PaletteIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  type GenerationMobileSheetKind,
  useGenerationMobileDock,
} from "~/routes/($lang).generation._index/contexts/generation-mobile-dock-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useImagesPerRequest } from "~/routes/($lang).generation._index/hooks/use-max-images-per-request"
import { useUserModelSelection } from "~/routes/($lang).generation._index/hooks/use-user-model-selection"
import { parseGenerationSize } from "~/routes/($lang).generation._index/types/generation-size"
import { toRatioLabel } from "~/routes/($lang).generation._index/utils/generation-size-options"
import { toResizedImageUrl } from "~/utils/resized-image-url"

/**
 * シートの見出し
 */
const useSheetTitle = (sheet: GenerationMobileSheetKind | null) => {
  const t = useTranslation()
  if (sheet === "model") return t("モデル", "Model")
  if (sheet === "lora") return "LoRA"
  if (sheet === "styles") return t("画風", "Styles")
  if (sheet === "size") return t("比率・解像度", "Size")
  if (sheet === "count") return t("枚数", "Count")
  return t("参照画像・詳細設定", "Reference & advanced")
}

/**
 * スマホの下の入力欄のチップ（押すとその項目だけのシートを開く。もう一度押すと閉じる）
 */
export function GenerationMobileChips() {
  const t = useTranslation()

  const dock = useGenerationMobileDock()

  const context = useGenerationContext()

  const userModelSelection = useUserModelSelection()

  const images = useImagesPerRequest()

  if (dock === null) return null

  const officialModel = context.imageModels.find(
    (model) => model.id === context.config.modelId,
  )

  const modelName = userModelSelection.checkpoint
    ? userModelSelection.checkpoint.name
    : (officialModel?.displayName ??
      officialModel?.name ??
      t("モデル", "Model"))

  const modelThumbnail = userModelSelection.checkpoint
    ? userModelSelection.checkpoint.thumbnailUrl
    : (officialModel?.thumbnailImageURL ?? null)

  const size = parseGenerationSize(context.config.sizeType)

  const ratio = size.width / Math.max(1, size.height)

  const loraCount = context.promptLoraModels.length

  const toggle = (kind: GenerationMobileSheetKind) => {
    dock.setSheet(dock.sheet === kind ? null : kind)
  }

  const chipClassName = (kind: GenerationMobileSheetKind) =>
    cn(
      "flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-3.5 font-medium text-sm transition-colors active:scale-95",
      dock.sheet === kind
        ? "border-foreground bg-foreground text-background"
        : "border-border bg-background text-foreground",
    )

  return (
    <div
      role="toolbar"
      aria-label={t("生成の設定", "Generation settings")}
      className="-mx-3 flex gap-2 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <button
        type="button"
        aria-expanded={dock.sheet === "model"}
        onClick={() => toggle("model")}
        className={cn(chipClassName("model"), "pl-1.5")}
      >
        {modelThumbnail ? (
          <img
            src={toResizedImageUrl(modelThumbnail, 64)}
            alt=""
            className="size-8 shrink-0 rounded-full object-cover"
            draggable={false}
          />
        ) : (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <BoxIcon className="size-4" />
          </span>
        )}
        <span className="max-w-[8.5rem] truncate">{modelName}</span>
      </button>
      <button
        type="button"
        aria-expanded={dock.sheet === "lora"}
        onClick={() => toggle("lora")}
        className={chipClassName("lora")}
      >
        <SparklesIcon className="size-4 shrink-0" />
        LoRA
        {loraCount > 0 && <span className="tabular-nums">{loraCount}</span>}
      </button>
      <button
        type="button"
        aria-expanded={dock.sheet === "styles"}
        onClick={() => toggle("styles")}
        className={chipClassName("styles")}
      >
        <PaletteIcon className="size-4 shrink-0" />
        {t("画風", "Styles")}
      </button>
      <button
        type="button"
        aria-expanded={dock.sheet === "size"}
        onClick={() => toggle("size")}
        className={chipClassName("size")}
      >
        {/* 比率の形の小さい四角 */}
        <span
          aria-hidden
          className="shrink-0 rounded-[3px] border-[1.5px] border-current"
          style={{
            width: ratio >= 1 ? 14 : Math.max(6, 14 * ratio),
            height: ratio >= 1 ? Math.max(6, 14 / ratio) : 14,
          }}
        />
        <span className="tabular-nums">
          {toRatioLabel(size.width, size.height)}
        </span>
        {context.config.upscaleSize === 2 && (
          <span className="font-semibold text-[11px]">HD</span>
        )}
      </button>
      <button
        type="button"
        aria-expanded={dock.sheet === "count"}
        onClick={() => toggle("count")}
        className={chipClassName("count")}
      >
        <ImagesIcon className="size-4 shrink-0" />
        <span className="tabular-nums">
          {t(`${images.count}枚`, `${images.count}`)}
        </span>
        {context.config.generationCount > 1 && (
          <span className="tabular-nums">
            ×{context.config.generationCount}
          </span>
        )}
      </button>
      <button
        type="button"
        aria-expanded={dock.sheet === "settings"}
        onClick={() => toggle("settings")}
        className={chipClassName("settings")}
      >
        <SlidersHorizontalIcon className="size-4 shrink-0" />
        {t("詳細", "Advanced")}
      </button>
    </div>
  )
}

/**
 * チップから開くシートの枠（中身はずっと描いたまま隠す。
 * 設定の部品は描き始めに参照画像などを初期化するので、開くたびに作り直さない）
 */
export function GenerationMobileSheetFrame(props: {
  children: React.ReactNode
  /** 見えている高さ（キーボードが出ているときは狭くする） */
  maxHeight: number
}) {
  const t = useTranslation()

  const dock = useGenerationMobileDock()

  const title = useSheetTitle(dock?.sheet ?? null)

  const isOpen = dock !== null && dock.sheet !== null

  return (
    <section
      aria-label={title}
      className={cn(
        "-mx-3 -mt-3 mb-2 flex-col overflow-hidden rounded-t-[20px] border-b",
        isOpen ? "flex" : "hidden",
      )}
      style={{ maxHeight: props.maxHeight }}
    >
      <div className="flex shrink-0 items-center gap-2 py-1 pr-1 pl-4">
        <h2 className="min-w-0 flex-1 truncate font-bold text-base">{title}</h2>
        <button
          type="button"
          onClick={() => dock?.setSheet(null)}
          aria-label={t("閉じる", "Close")}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
        >
          <XIcon className="size-5" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-3">
        {props.children}
      </div>
    </section>
  )
}
