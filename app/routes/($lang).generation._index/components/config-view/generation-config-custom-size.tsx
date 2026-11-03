import { useEffect, useState } from "react"
import { Input } from "~/components/ui/input"
import { Slider } from "~/components/ui/slider"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import {
  customGenerationSizeMax,
  customGenerationSizeMin,
  customGenerationSizeStep,
  freeGenerationMaxPixels,
  normalizeCustomSide,
} from "~/routes/($lang).generation._index/types/generation-size"

type Props = {
  width: number
  height: number
  isPaidPlan: boolean
  onChange(width: number, height: number): void
}

const quickLongSides = [1024, 1536, 2048]

/**
 * 幅と高さの指定（数字の入力とスライダーのどちらでも変えられる）
 */
export function GenerationConfigCustomSize(props: Props) {
  const t = useTranslation()

  const pixels = props.width * props.height

  const isOverFreeLimit = !props.isPaidPlan && pixels > freeGenerationMaxPixels

  /**
   * 比率を保ったまま長辺を変える
   */
  const onSelectLongSide = (longSide: number) => {
    const scale = longSide / Math.max(props.width, props.height)
    props.onChange(
      normalizeCustomSide(props.width * scale),
      normalizeCustomSide(props.height * scale),
    )
  }

  return (
    <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
      <SideField
        label={t("幅", "Width")}
        value={props.width}
        onChange={(width) => props.onChange(width, props.height)}
      />
      <SideField
        label={t("高さ", "Height")}
        value={props.height}
        onChange={(height) => props.onChange(props.width, height)}
      />
      <div className="flex items-center gap-1.5">
        <span className="shrink-0 text-muted-foreground text-xs">
          {t("長辺", "Long side")}
        </span>
        {quickLongSides.map((longSide) => (
          <button
            key={longSide}
            type="button"
            aria-pressed={Math.max(props.width, props.height) === longSide}
            onClick={() => onSelectLongSide(longSide)}
            className={cn(
              "h-8 flex-1 rounded-lg border text-xs tabular-nums transition-colors",
              Math.max(props.width, props.height) === longSide
                ? "border-foreground/70 bg-background font-semibold"
                : "border-transparent bg-muted/60 text-muted-foreground hover:bg-muted",
            )}
          >
            {longSide}
          </button>
        ))}
      </div>
      <p className="text-muted-foreground text-xs">
        {t(
          `${customGenerationSizeMin}〜${customGenerationSizeMax} の範囲で指定してください（8 の倍数にそろえます）。今のサイズは約 ${(pixels / 1_000_000).toFixed(1)} メガピクセルです。`,
          `Use ${customGenerationSizeMin}-${customGenerationSizeMax} (rounded to multiples of 8). Now about ${(pixels / 1_000_000).toFixed(1)} megapixels.`,
        )}
      </p>
      {isOverFreeLimit && (
        <p className="text-rose-600 text-xs dark:text-rose-400">
          {t(
            "サブスクに入っていない場合は 2048×2048（約4メガピクセル）までです。",
            "Without a plan, the limit is 2048×2048 (about 4 megapixels). ",
          )}
          <Link to="/plus" className="underline">
            {t("プランを見る", "See plans")}
          </Link>
        </p>
      )}
    </div>
  )
}

/**
 * 幅または高さの 1 行
 * 入力中は自由に打てるようにして、確定したときに範囲へ収める
 */
function SideField(props: {
  label: string
  value: number
  onChange(value: number): void
}) {
  const t = useTranslation()

  const [text, setText] = useState(String(props.value))

  useEffect(() => {
    setText(String(props.value))
  }, [props.value])

  const typed = Number.parseInt(text, 10)

  const isOutOfRange =
    text !== "" &&
    (!Number.isFinite(typed) ||
      typed < customGenerationSizeMin ||
      typed > customGenerationSizeMax)

  const commit = () => {
    if (!Number.isFinite(typed)) {
      setText(String(props.value))
      return
    }
    const next = normalizeCustomSide(typed)
    setText(String(next))
    if (next !== props.value) props.onChange(next)
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <label className="flex shrink-0 items-center gap-2 text-sm">
          <span className="w-7 font-medium">{props.label}</span>
          <Input
            type="number"
            inputMode="numeric"
            min={customGenerationSizeMin}
            max={customGenerationSizeMax}
            step={customGenerationSizeStep}
            value={text}
            aria-invalid={isOutOfRange}
            onChange={(event) => setText(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === "Enter") commit()
            }}
            className={cn(
              "h-9 w-20 px-2 text-base tabular-nums md:text-sm",
              isOutOfRange && "border-rose-500",
            )}
          />
        </label>
        <Slider
          aria-label={props.label}
          value={[props.value]}
          min={customGenerationSizeMin}
          max={normalizeCustomSide(customGenerationSizeMax)}
          step={customGenerationSizeStep}
          onValueChange={(values) => {
            const next = values[0]
            if (next !== undefined) props.onChange(next)
          }}
          className="flex-1"
        />
      </div>
      {isOutOfRange && (
        <p className="text-rose-600 text-xs dark:text-rose-400">
          {t(
            `${customGenerationSizeMin}〜${customGenerationSizeMax} の範囲で指定してください`,
            `Use a value from ${customGenerationSizeMin} to ${customGenerationSizeMax}`,
          )}
        </p>
      )}
    </div>
  )
}
