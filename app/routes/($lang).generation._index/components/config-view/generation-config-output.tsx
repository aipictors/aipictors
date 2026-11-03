import { Link } from "~/lib/app/locale-router"
import {
  ArrowLeftRightIcon,
  LockIcon,
  SlidersHorizontalIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useImagesPerRequest } from "~/routes/($lang).generation._index/hooks/use-max-images-per-request"
import { GenerationConfigCustomSize } from "~/routes/($lang).generation._index/components/config-view/generation-config-custom-size"
import {
  isCustomSizeType,
  isUpscaleOverFreeLimit,
  normalizeCustomSide,
  parseGenerationSize,
  toCustomSizeType,
} from "~/routes/($lang).generation._index/types/generation-size"
import {
  canUseCustomGenerationSize,
  findNearestSizeType,
  getGenerationSizeOptions,
} from "~/routes/($lang).generation._index/utils/generation-size-options"
import { getGenerationSizeMultiplier } from "~/routes/($lang).generation._index/utils/generation-submit-coin"

type Props = {
  modelType: string
}

const sizeButtonClass =
  "flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl border text-[11px] transition-colors"
const sizeButtonOn = "border-foreground/70 bg-background font-semibold shadow-sm"
const sizeButtonOff =
  "border-transparent bg-muted/60 text-muted-foreground hover:bg-muted"

/**
 * 出力の設定（同時生成枚数・比率・解像度）
 * よく変える 3 つをボタンで選べるようにまとめる
 */
export function GenerationConfigOutput(props: Props) {
  const context = useGenerationContext()

  const t = useTranslation()

  const images = useImagesPerRequest()

  const sizeOptions = getGenerationSizeOptions(props.modelType)

  const canCustomize = canUseCustomGenerationSize(props.modelType)

  const isCustom = isCustomSizeType(context.config.sizeType)

  const currentSize = isCustom
    ? parseGenerationSize(context.config.sizeType)
    : (sizeOptions.find(
        (option) => option.sizeType === context.config.sizeType,
      ) ?? sizeOptions[0])

  const [isCustomOpen, setIsCustomOpen] = useState(false)

  // 指定のサイズを選んでいる間は入力欄を出したままにする（プリセットと同じサイズでも）
  const isCustomPanelOpen = canCustomize && (isCustomOpen || isCustom)

  // 正方形のときはどちらの向きの比率を並べるかを覚えておく
  const [isLandscapeList, setIsLandscapeList] = useState(false)

  const isLandscape = currentSize
    ? currentSize.width === currentSize.height
      ? isLandscapeList
      : currentSize.width > currentSize.height
    : isLandscapeList

  // 縦長（または横長）と正方形だけ並べる。逆の向きは「入替」で切り替える
  const shownSizeOptions = sizeOptions.filter((option) => {
    if (option.width === option.height) return true
    return option.width > option.height === isLandscape
  })

  const onSwap = () => {
    if (!currentSize) return
    if (currentSize.width === currentSize.height) {
      setIsLandscapeList(!isLandscapeList)
      return
    }
    setIsLandscapeList(!isLandscape)
    const swapped = sizeOptions.find((option) => {
      return (
        option.width === currentSize.height &&
        option.height === currentSize.width
      )
    })
    if (swapped && !isCustom) {
      context.updateSizeType(swapped.sizeType)
      return
    }
    context.updateSizeType(
      toCustomSizeType(currentSize.height, currentSize.width),
    )
  }

  const onToggleCustom = () => {
    if (isCustomPanelOpen) {
      setIsCustomOpen(false)
      if (isCustom) {
        // 指定をやめるときは一番近い比率に戻す
        context.updateSizeType(findNearestSizeType(sizeOptions, currentSize))
      }
      return
    }
    setIsCustomOpen(true)
    if (currentSize) {
      context.updateSizeType(
        toCustomSizeType(
          normalizeCustomSide(currentSize.width),
          normalizeCustomSide(currentSize.height),
        ),
      )
    }
  }

  const isUpscale =
    context.config.upscaleSize !== null && context.config.upscaleSize > 1

  // サブスクでない人は拡大後のサイズも 2048×2048 まで
  const isUpscaleOverLimit = isUpscaleOverFreeLimit(
    context.config.sizeType,
    images.isPaidPlan,
  )

  // 大きいサイズにしたら、選べなくなった高解像度は標準に戻す
  useEffect(() => {
    if (isUpscale && isUpscaleOverLimit) {
      context.changeUpscaleSize(null)
    }
  }, [isUpscale, isUpscaleOverLimit])

  const canUpscale =
    context.config.modelType !== "GEMINI" && context.config.modelType !== "SD5"

  const sizeMultiplier = getGenerationSizeMultiplier(context.config.sizeType)

  /**
   * 1 枚にしかできない理由
   */
  const singleOnlyReason = (() => {
    if (images.max > 1) return null
    if (isUpscale) return t("高解像度は1枚ずつ", "High resolution: 1 image")
    if (context.config.controlNetImageBase64 !== null) {
      return t("ControlNet使用時は1枚ずつ", "ControlNet: 1 image")
    }
    if (context.config.i2iImageBase64) {
      return t("画像から生成は1枚ずつ", "Image to image: 1 image")
    }
    if (sizeMultiplier > 1) {
      return t("大きいサイズは1枚ずつ", "Large size: 1 image")
    }
    return t("このモデルは1枚ずつ", "This model makes 1 image")
  })()

  const countOptions = [1, 2, 3, 4]

  return (
    <div className="flex flex-col gap-4">
      {/* 同時生成枚数 */}
      <section className="space-y-2">
        <div className="flex items-center gap-1.5">
          <h3 className="font-bold text-sm">
            {t("同時生成枚数", "Images per generation")}
          </h3>
          <CrossPlatformTooltip
            text={t(
              "1回の生成で作る枚数です。コインは枚数分かかります。プロンプトを試すときは1枚、本番はまとめて作ると便利です。",
              "How many images one generation makes. Coins are per image. Try prompts with 1, then make several.",
            )}
          />
          {singleOnlyReason && (
            <span className="ml-auto text-muted-foreground text-xs">
              {singleOnlyReason}
            </span>
          )}
        </div>
        <div className="grid grid-cols-4 gap-1 rounded-xl border bg-muted/40 p-1">
          {countOptions.map((count) => {
            const isLockedByPlan = count > images.planMax
            const isDisabled = count > images.max
            const isSelected = images.count === count
            return (
              <button
                key={count}
                type="button"
                disabled={isDisabled}
                aria-pressed={isSelected}
                title={
                  isLockedByPlan
                    ? t("ライト以上のプランで4枚まで", "Up to 4 with LITE+")
                    : undefined
                }
                onClick={() => {
                  // 上限を選んだときは「まとめて」（プランや設定が変わっても上限に合わせる）
                  images.setPreference(count >= images.planMax ? null : count)
                }}
                className={cn(
                  "flex h-9 items-center justify-center gap-1 rounded-lg text-sm transition-colors",
                  isSelected
                    ? "bg-background font-semibold text-fuchsia-600 shadow-sm ring-1 ring-fuchsia-500/40 dark:text-fuchsia-300"
                    : "text-muted-foreground hover:text-foreground",
                  isDisabled &&
                    "cursor-not-allowed opacity-40 hover:text-muted-foreground",
                )}
              >
                {isLockedByPlan && <LockIcon className="size-3" />}
                {t(`${count}枚`, `${count}`)}
              </button>
            )
          })}
        </div>
        {context.config.seed !== -1 && images.count > 1 && (
          <p className="text-muted-foreground text-xs">
            {t(
              `Seed ${context.config.seed}〜${context.config.seed + images.count - 1} で${images.count}枚作ります（1枚目は今のSeedと同じ絵）`,
              `Makes ${images.count} images with seeds ${context.config.seed}-${context.config.seed + images.count - 1}`,
            )}
          </p>
        )}
        {!images.isPaidPlan && (
          <p className="text-muted-foreground text-xs">
            {t("無料は2枚まで。", "Free plan: up to 2. ")}
            <Link
              to="/plus"
              className="text-fuchsia-600 hover:underline dark:text-fuchsia-300"
            >
              {t("プランで4枚まで", "Up to 4 with a plan")}
            </Link>
          </p>
        )}
      </section>

      {/* 比率 */}
      {sizeOptions.length > 1 && (
        <section className="space-y-2">
          <h3 className="font-bold text-sm">{t("比率", "Aspect ratio")}</h3>
          <div
            className="grid gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${shownSizeOptions.length + 1 + (canCustomize ? 1 : 0)}, minmax(0, 1fr))`,
            }}
          >
            {shownSizeOptions.map((option) => {
              const isSelected =
                !isCustom && option.sizeType === context.config.sizeType
              const ratio = option.width / option.height
              // アイコンの枠（最大 18px）
              const iconWidth = ratio >= 1 ? 18 : Math.max(7, 18 * ratio)
              const iconHeight = ratio >= 1 ? Math.max(7, 18 / ratio) : 18
              return (
                <button
                  key={option.sizeType}
                  type="button"
                  aria-pressed={isSelected}
                  title={`${option.width}×${option.height}`}
                  onClick={() => {
                    setIsCustomOpen(false)
                    context.updateSizeType(option.sizeType)
                  }}
                  className={cn(sizeButtonClass, isSelected ? sizeButtonOn : sizeButtonOff)}
                >
                  <span className="flex h-5 items-center justify-center">
                    <span
                      className="rounded-[3px] border-[1.5px] border-current"
                      style={{ width: iconWidth, height: iconHeight }}
                    />
                  </span>
                  {option.ratioLabel}
                </button>
              )
            })}
            <button
              type="button"
              aria-label={t("縦と横を入れ替える", "Swap width and height")}
              title={t("縦と横を入れ替える", "Swap width and height")}
              onClick={onSwap}
              className={cn(sizeButtonClass, sizeButtonOff)}
            >
              <ArrowLeftRightIcon className="size-5" />
              {t("入替", "Swap")}
            </button>
            {canCustomize && (
              <button
                type="button"
                aria-pressed={isCustomPanelOpen}
                aria-expanded={isCustomPanelOpen}
                aria-label={t("幅と高さを指定する", "Set width and height")}
                title={t("幅と高さを指定する", "Set width and height")}
                onClick={onToggleCustom}
                className={cn(
                  sizeButtonClass,
                  isCustomPanelOpen ? sizeButtonOn : sizeButtonOff,
                )}
              >
                <SlidersHorizontalIcon className="size-5" />
                {t("指定", "Custom")}
              </button>
            )}
          </div>
          {isCustomPanelOpen && currentSize && (
            <GenerationConfigCustomSize
              width={currentSize.width}
              height={currentSize.height}
              isPaidPlan={images.isPaidPlan}
              onChange={(width, height) => {
                context.updateSizeType(toCustomSizeType(width, height))
              }}
            />
          )}
        </section>
      )}

      {/* 解像度 */}
      {currentSize && (
        <section className="space-y-2">
          <h3 className="font-bold text-sm">{t("解像度", "Resolution")}</h3>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              aria-pressed={!isUpscale}
              onClick={() => context.changeUpscaleSize(null)}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border px-2 py-2 transition-colors",
                !isUpscale
                  ? "border-foreground/70 bg-background shadow-sm"
                  : "border-transparent bg-muted/60 text-muted-foreground hover:bg-muted",
              )}
            >
              <span className="font-bold text-sm">{t("標準", "Standard")}</span>
              <span className="text-muted-foreground text-xs tabular-nums">
                {currentSize.width}×{currentSize.height}
                {sizeMultiplier > 1 && (
                  <span className="ml-1">
                    {t(`・1枚 ${sizeMultiplier}倍`, `· 1 img, ${sizeMultiplier}x`)}
                  </span>
                )}
              </span>
            </button>
            <button
              type="button"
              aria-pressed={isUpscale}
              disabled={!canUpscale || isUpscaleOverLimit}
              title={
                isUpscaleOverLimit
                  ? t(
                      "サブスクに入っていない場合、出力は2048×2048までです",
                      "Without a plan, output is limited to 2048×2048",
                    )
                  : undefined
              }
              onClick={() => context.changeUpscaleSize(2)}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border px-2 py-2 transition-colors",
                isUpscale
                  ? "border-foreground/70 bg-background shadow-sm"
                  : "border-transparent bg-muted/60 text-muted-foreground hover:bg-muted",
                (!canUpscale || isUpscaleOverLimit) &&
                  "cursor-not-allowed opacity-40",
              )}
            >
              <span className="font-bold text-sm">
                {t("高解像度", "High-res")}
              </span>
              <span className="text-muted-foreground text-xs tabular-nums">
                {currentSize.width * 2}×{currentSize.height * 2}
                <span className="ml-1">
                  {t(
                    `・1枚 ${sizeMultiplier * 2}倍`,
                    `· 1 img, ${sizeMultiplier * 2}x`,
                  )}
                </span>
              </span>
            </button>
          </div>
          {isUpscaleOverLimit && canUpscale && (
            <p className="text-muted-foreground text-xs">
              {t(
                "高解像度は拡大後が2048×2048までのサイズで使えます。",
                "High-res works up to 2048×2048 after upscaling. ",
              )}
              <Link
                to="/plus"
                className="text-fuchsia-600 hover:underline dark:text-fuchsia-300"
              >
                {t("プランならこの上限はありません", "No limit with a plan")}
              </Link>
            </p>
          )}
        </section>
      )}
    </div>
  )
}
