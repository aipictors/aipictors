import {
  ArrowLeftRightIcon,
  LockIcon,
  SlidersHorizontalIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { GenerationConfigCustomSize } from "~/routes/($lang).generation._index/components/config-view/generation-config-custom-size"
import {
  ConfigSectionHeader,
  configAccentLink,
  configChipClass,
} from "~/routes/($lang).generation._index/components/config-view/generation-config-parts"
import { GenerationOptionExplanation } from "~/routes/($lang).generation._index/components/config-view/generation-option-explanation"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useImagesPerRequest } from "~/routes/($lang).generation._index/hooks/use-max-images-per-request"
import {
  isCustomSizeType,
  isUpscaleOverFreeLimit,
  normalizeCustomSide,
  parseGenerationSize,
  toCustomSizeType,
} from "~/routes/($lang).generation._index/types/generation-size"
import { openGenerationPlanUpgrade } from "~/routes/($lang).generation._index/utils/generation-plan-upgrade-store"
import {
  canUseCustomGenerationSize,
  findNearestSizeType,
  getGenerationSizeOptions,
} from "~/routes/($lang).generation._index/utils/generation-size-options"
import { getGenerationSizeMultiplier } from "~/routes/($lang).generation._index/utils/generation-submit-coin"

type Props = {
  modelType: string
  /**
   * スマホのカードで分けて出すとき（count = 同時生成枚数だけ、size = 比率と解像度だけ）
   */
  part?: "count" | "size"
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

  // スマホのカード（タップしやすく少し高くし、選んだ枚数も見出しに出す）
  const isCardPart = props.part !== undefined

  return (
    <div className="flex flex-col gap-5">
      {/* 同時生成枚数 */}
      {props.part !== "size" && (
        <section className="space-y-2">
          <ConfigSectionHeader
            title={t("同時生成枚数", "Images per generation")}
            tooltip={t(
              "1回の生成で作る枚数です。コインは枚数分かかります。プロンプトを試すときは1枚、本番はまとめて作ると便利です。",
              "How many images one generation makes. Coins are per image. Try prompts with 1, then make several.",
            )}
            aside={
              singleOnlyReason ??
              (isCardPart && (
                <span className="font-semibold text-foreground text-sm tabular-nums">
                  {t(`${images.count}枚`, `${images.count}`)}
                </span>
              ))
            }
          />
          <div
            className={cn(
              "grid grid-cols-4 gap-1.5",
              isCardPart && "[&>button]:min-h-10",
            )}
            role="group"
            aria-label={t("同時生成枚数", "Images per generation")}
          >
            {countOptions.map((count) => {
              const isLockedByPlan = count > images.planMax
              // プランで増やせるだけのとき（ほかの設定で 1 枚になっていない）は押せるようにして、プランの案内を出す
              const isPlanGate = isLockedByPlan && images.max === images.planMax
              const isDisabled = count > images.max && !isPlanGate
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
                    if (isPlanGate) {
                      openGenerationPlanUpgrade({
                        requiredPlan: "LITE",
                        title: t(
                          `${count}枚まとめて作るのはライト以上で使えます`,
                          `Making ${count} at once needs Lite or above`,
                        ),
                        description: t(
                          "プランに入ると、1回の生成で4枚まとめて作れます。",
                          "With a plan, one click makes up to 4 images.",
                        ),
                        source: "images_per_request",
                      })
                      return
                    }
                    // 上限を選んだときは「まとめて」（プランや設定が変わっても上限に合わせる）
                    images.setPreference(count >= images.planMax ? null : count)
                  }}
                  className={cn(
                    configChipClass({
                      isSelected,
                      isDisabled,
                    }),
                    isPlanGate && "text-muted-foreground",
                  )}
                >
                  {isLockedByPlan && <LockIcon className="size-3" />}
                  {t(`${count}枚`, `${count}`)}
                </button>
              )
            })}
          </div>
          {/* スマホ: Seed を指定している間は別の枚数を覚えているので、切り替えたときの枚数も見せる */}
          {isCardPart &&
            images.isSeedFixed &&
            images.max > 1 &&
            images.count !== images.otherCount && (
              <p className="rounded-lg bg-muted/70 px-2.5 py-2 text-xs leading-relaxed">
                {t(
                  `Seed を指定している間の枚数です。Seed をランダムに戻すと${images.otherCount}枚になります`,
                  `This is the count while a seed is set. With a random seed it is ${images.otherCount}`,
                )}
              </p>
            )}
          {context.config.seed !== -1 && images.count > 1 && (
            <p className="text-muted-foreground text-xs">
              {t(
                `Seed ${context.config.seed}〜${context.config.seed + images.count - 1} で${images.count}枚作ります（1枚目は今のSeedと同じ絵）`,
                `Makes ${images.count} images with seeds ${context.config.seed}-${context.config.seed + images.count - 1}`,
              )}
            </p>
          )}
          {images.isLiteDayTrial && (
            <p className="text-fuchsia-700 text-xs dark:text-fuchsia-300">
              {t(
                "ライト1日体験中：今日の24時まで1回4枚まで作れます",
                "Lite day pass: up to 4 per run until midnight (JST)",
              )}
            </p>
          )}
          {!images.isPaidPlan && !images.isLiteDayTrial && (
            <p className="text-muted-foreground text-xs">
              {t("無料は1回1枚。", "Free plan: 1 per run. ")}
              <Link to="/plus" className={configAccentLink}>
                {t("プランで4枚まで", "Up to 4 with a plan")}
              </Link>
            </p>
          )}
        </section>
      )}

      {/* 比率 */}
      {props.part !== "count" && sizeOptions.length > 1 && (
        <section className="space-y-2">
          <ConfigSectionHeader title={t("比率", "Aspect ratio")} />
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
              // アイコンの枠（最大 14px）
              const iconWidth = ratio >= 1 ? 14 : Math.max(6, 14 * ratio)
              const iconHeight = ratio >= 1 ? Math.max(6, 14 / ratio) : 14
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
                  className={configChipClass({
                    isSelected,
                    className: "flex-col gap-0.5 py-1.5 text-xs",
                  })}
                >
                  <span className="flex h-3.5 items-center justify-center">
                    <span
                      className="rounded-[2px] border-[1.5px] border-current"
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
              className={configChipClass({
                isSelected: false,
                className: "flex-col gap-0.5 py-1.5 text-xs",
              })}
            >
              <ArrowLeftRightIcon className="size-3.5" />
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
                className={configChipClass({
                  isSelected: isCustomPanelOpen,
                  className: "flex-col gap-0.5 py-1.5 text-xs",
                })}
              >
                <SlidersHorizontalIcon className="size-3.5" />
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
      {props.part !== "count" && currentSize && (
        <section className="space-y-2">
          <ConfigSectionHeader title={t("解像度", "Resolution")} />
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              aria-pressed={!isUpscale}
              onClick={() => context.changeUpscaleSize(null)}
              className={configChipClass({
                isSelected: !isUpscale,
                className: "flex-col gap-0 py-1.5",
              })}
            >
              <span>{t("標準", "Standard")}</span>
              <span className="font-normal text-muted-foreground text-xs tabular-nums">
                {currentSize.width}×{currentSize.height}
                {sizeMultiplier > 1 && (
                  <span className="ml-1">
                    {t(
                      `・1枚 ${sizeMultiplier}倍`,
                      `· 1 img, ${sizeMultiplier}x`,
                    )}
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
              className={configChipClass({
                isSelected: isUpscale,
                isDisabled: !canUpscale || isUpscaleOverLimit,
                className: "flex-col gap-0 py-1.5",
              })}
            >
              <span>{t("高解像度", "High-res")}</span>
              <span className="font-normal text-muted-foreground text-xs tabular-nums">
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
          {/* 高解像度にしたらどうなるか（公平な見本の画像がないので文字だけ） */}
          {canUpscale && !isUpscaleOverLimit && (
            <GenerationOptionExplanation
              text={t(
                "高解像度: 縦横2倍の大きさで書き出します。大きく表示したいときや壁紙に。",
                "High-res: outputs at twice the width and height. For large displays or wallpapers.",
              )}
              coin={t(
                "コインは標準の2倍・1回1枚",
                "2x the standard coins · 1 image per run",
              )}
            />
          )}
          {isUpscaleOverLimit && canUpscale && (
            <p className="text-muted-foreground text-xs">
              {t(
                "高解像度は拡大後が2048×2048までのサイズで使えます。",
                "High-res works up to 2048×2048 after upscaling. ",
              )}
              <Link to="/plus" className={configAccentLink}>
                {t("プランならこの上限はありません", "No limit with a plan")}
              </Link>
            </p>
          )}
        </section>
      )}
    </div>
  )
}
