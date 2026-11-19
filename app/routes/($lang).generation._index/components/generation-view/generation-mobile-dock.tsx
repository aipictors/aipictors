import {
  BoxIcon,
  ImagesIcon,
  PaletteIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
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

  /**
   * 何か付けている・変えている項目（チップに点を付ける）
   */
  const changed: Record<GenerationMobileSheetKind, boolean> = {
    model: userModelSelection.checkpoint !== null,
    lora: loraCount > 0,
    styles: false,
    size: context.config.upscaleSize === 2,
    count: images.count > 1 || context.config.generationCount > 1,
    settings:
      context.config.seed !== -1 ||
      !!context.config.i2iImageBase64 ||
      context.config.controlNetImageBase64 !== null,
  }

  const dot = (kind: GenerationMobileSheetKind) =>
    changed[kind] && (
      <span
        aria-hidden
        className={cn(
          "absolute top-1 right-1 size-2.5 rounded-full border-2",
          dock.sheet === kind
            ? "border-foreground bg-fuchsia-400"
            : "border-background bg-fuchsia-500",
        )}
      />
    )

  const chipClassName = (kind: GenerationMobileSheetKind) =>
    cn(
      "relative flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-3.5 font-medium text-sm transition-colors active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100",
      dock.sheet === kind
        ? "border-foreground bg-foreground text-background"
        : "border-border bg-background text-foreground",
    )

  return (
    <div
      role="toolbar"
      aria-label={t("生成の設定", "Generation settings")}
      // 端を薄くして、横に続きがあることが分かるようにする
      className="-mx-3 flex gap-2 overflow-x-auto px-3 [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-28px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
        {dot("model")}
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
        {dot("lora")}
      </button>
      <button
        type="button"
        aria-expanded={dock.sheet === "styles"}
        onClick={() => toggle("styles")}
        className={chipClassName("styles")}
      >
        <PaletteIcon className="size-4 shrink-0" />
        {t("画風", "Styles")}
        {dot("styles")}
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
        {dot("size")}
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
        {dot("count")}
      </button>
      <button
        type="button"
        aria-expanded={dock.sheet === "settings"}
        onClick={() => toggle("settings")}
        className={chipClassName("settings")}
      >
        <SlidersHorizontalIcon className="size-4 shrink-0" />
        {t("詳細", "Advanced")}
        {dot("settings")}
      </button>
    </div>
  )
}

/**
 * シートの上に出す、今の設定の要約
 */
const useSheetSummary = (sheet: GenerationMobileSheetKind | null) => {
  const t = useTranslation()
  const context = useGenerationContext()
  const userModelSelection = useUserModelSelection()
  const images = useImagesPerRequest()
  if (sheet === "model") {
    const official = context.imageModels.find(
      (model) => model.id === context.config.modelId,
    )
    return userModelSelection.checkpoint
      ? userModelSelection.checkpoint.name
      : (official?.displayName ?? official?.name ?? "")
  }
  if (sheet === "lora") {
    const names = context.promptLoraModels.map((text) => text.split(":")[0])
    return names.length === 0
      ? t(
          `なし（${context.availableLoraModelsCount} 個まで）`,
          `None (up to ${context.availableLoraModelsCount})`,
        )
      : `${names.length} / ${context.availableLoraModelsCount}・${names.join(", ")}`
  }
  if (sheet === "styles") {
    return t("選ぶとプロンプトや LoRA に足します", "Adds to the prompt or LoRA")
  }
  if (sheet === "size") {
    const size = parseGenerationSize(context.config.sizeType)
    return [
      toRatioLabel(size.width, size.height),
      `${size.width}×${size.height}`,
      context.config.upscaleSize === 2 ? t("高解像度", "High-res") : null,
    ]
      .filter(Boolean)
      .join("・")
  }
  if (sheet === "count") {
    return t(
      `1回 ${images.count}枚・続けて ${context.config.generationCount}回`,
      `${images.count} per run · ${context.config.generationCount} runs`,
    )
  }
  return [
    context.config.seed === -1
      ? t("Seed ランダム", "Seed random")
      : `Seed ${context.config.seed}`,
    `CFG ${context.config.scale}`,
    `Steps ${context.config.steps}`,
    context.config.i2iImageBase64 ? t("画像から生成", "img2img") : null,
    context.config.controlNetImageBase64 ? "ControlNet" : null,
  ]
    .filter(Boolean)
    .join("・")
}

/**
 * チップから開くシートの枠（中身はずっと描いたまま隠す。
 * 設定の部品は描き始めに参照画像などを初期化するので、開くたびに作り直さない）
 * 上のつまみを下に引くと半分に戻す・閉じる、上に引くと広げる
 */
export function GenerationMobileSheetFrame(props: {
  children: React.ReactNode
  /** 半分の高さ（キーボードが出ているときは狭くする） */
  maxHeight: number
  /** 広げたときの高さ */
  fullHeight: number
}) {
  const t = useTranslation()

  const dock = useGenerationMobileDock()

  const sheet = dock?.sheet ?? null

  const title = useSheetTitle(sheet)

  const summary = useSheetSummary(sheet)

  const isOpen = sheet !== null

  const [isExpanded, setIsExpanded] = useState(false)

  const [dragY, setDragY] = useState(0)

  const dragStartRef = useRef<number | null>(null)

  // 別のシートに切り替えたら半分の高さに戻す
  useEffect(() => {
    setIsExpanded(false)
    setDragY(0)
  }, [sheet])

  const onPointerDown = (event: React.PointerEvent) => {
    dragStartRef.current = event.clientY
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent) => {
    if (dragStartRef.current === null) return
    setDragY(event.clientY - dragStartRef.current)
  }

  const onPointerUp = () => {
    if (dragStartRef.current === null) return
    dragStartRef.current = null
    const distance = dragY
    setDragY(0)
    if (distance > 72) {
      if (isExpanded) {
        setIsExpanded(false)
        return
      }
      dock?.setSheet(null)
      return
    }
    if (distance < -48) {
      setIsExpanded(true)
      return
    }
    // ほとんど動かさずに離したら（つまみを押しただけ）広げる・戻すを切り替える
    if (Math.abs(distance) < 6) {
      setIsExpanded(!isExpanded)
    }
  }

  const height = isExpanded
    ? Math.max(props.fullHeight, props.maxHeight)
    : props.maxHeight

  return (
    <section
      aria-label={title}
      className={cn(
        "-mx-3 -mt-3 mb-2 flex-col overflow-hidden rounded-t-[20px] border-b transition-[max-height,height] duration-200 motion-reduce:transition-none",
        isOpen ? "flex" : "hidden",
      )}
      style={{
        maxHeight: height,
        height: isExpanded ? height : undefined,
        transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
      }}
    >
      <div className="flex shrink-0 items-start gap-2 pr-1 pl-4">
        <button
          type="button"
          // つまみ（下に引いて閉じる・上に引いて広げる）
          aria-label={
            isExpanded
              ? t("シートを半分に戻す", "Collapse sheet")
              : t("シートを広げる", "Expand sheet")
          }
          // キーボードで押したとき（指・マウスは onPointerUp で扱う）
          onClick={(event) => {
            if (event.detail === 0) setIsExpanded(!isExpanded)
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="block min-w-0 flex-1 cursor-grab touch-none select-none pt-2 pb-2 text-left"
        >
          <span className="mx-auto mb-2 block h-1 w-10 translate-x-6 rounded-full bg-muted-foreground/30" />
          <span className="block truncate text-muted-foreground text-xs">
            <span className="mr-1.5 font-semibold text-foreground">
              {title}
            </span>
            {summary}
          </span>
        </button>
        <button
          type="button"
          onClick={() => dock?.setSheet(null)}
          aria-label={t("閉じる", "Close")}
          className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
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
