import { Link } from "@remix-run/react"
import { LockIcon } from "lucide-react"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useImagesPerRequest } from "~/routes/($lang).generation._index/hooks/use-max-images-per-request"
import { getGenerationSizeOptions } from "~/routes/($lang).generation._index/utils/generation-size-options"

type Props = {
  modelType: string
}

/**
 * 出力の設定（同時生成枚数・比率・解像度）
 * よく変える 3 つをボタンで選べるようにまとめる
 */
export function GenerationConfigOutput(props: Props) {
  const context = useGenerationContext()

  const t = useTranslation()

  const images = useImagesPerRequest()

  const sizeOptions = getGenerationSizeOptions(props.modelType)

  const currentSize =
    sizeOptions.find((option) => option.sizeType === context.config.sizeType) ??
    sizeOptions[0]

  const isUpscale =
    context.config.upscaleSize !== null && context.config.upscaleSize > 1

  const canUpscale =
    context.config.modelType !== "GEMINI" && context.config.modelType !== "SD5"

  /**
   * 1 枚にしかできない理由
   */
  const singleOnlyReason = (() => {
    if (images.max > 1) return null
    if (isUpscale) return t("高解像度は1枚ずつ", "High resolution: 1 image")
    if (context.config.controlNetImageBase64 !== null) {
      return t("ControlNet使用時は1枚ずつ", "ControlNet: 1 image")
    }
    if (context.config.seed !== -1) {
      return t("Seed指定時は1枚ずつ", "Fixed seed: 1 image")
    }
    if (context.config.i2iImageBase64) {
      return t("画像から生成は1枚ずつ", "Image to image: 1 image")
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
          <div className="flex flex-wrap gap-1.5">
            {sizeOptions.map((option) => {
              const isSelected = option.sizeType === currentSize?.sizeType
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
                  onClick={() => context.updateSizeType(option.sizeType)}
                  className={cn(
                    "flex h-14 w-14 flex-col items-center justify-center gap-1 rounded-xl border text-[11px] transition-colors",
                    isSelected
                      ? "border-foreground/70 bg-background font-semibold shadow-sm"
                      : "border-transparent bg-muted/60 text-muted-foreground hover:bg-muted",
                  )}
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
          </div>
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
              </span>
            </button>
            <button
              type="button"
              aria-pressed={isUpscale}
              disabled={!canUpscale}
              onClick={() => context.changeUpscaleSize(2)}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border px-2 py-2 transition-colors",
                isUpscale
                  ? "border-foreground/70 bg-background shadow-sm"
                  : "border-transparent bg-muted/60 text-muted-foreground hover:bg-muted",
                !canUpscale && "cursor-not-allowed opacity-40",
              )}
            >
              <span className="font-bold text-sm">
                {t("高解像度", "High-res")}
              </span>
              <span className="text-muted-foreground text-xs tabular-nums">
                {currentSize.width * 2}×{currentSize.height * 2}
                <span className="ml-1">{t("・1枚 3倍", "· 1 img, 3x")}</span>
              </span>
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
