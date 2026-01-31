import { Button } from "~/components/ui/button"
import { Slider } from "~/components/ui/slider"
import { useTranslation } from "~/hooks/use-translation"
import { parseGenerationSize } from "~/routes/($lang).generation._index/types/generation-size"

type Props = {
  modelType: string
  value: string
  onChange(value: string): void
}

export function GenerationConfigSize (props: Props) {
  const t = useTranslation()

  const sizeOptionsByModelType: Record<
    string,
    {
      square: string[]
      portrait: string[]
      landscape: string[]
    }
  > = {
    SD1: {
      square: ["SD1_512_512"],
      portrait: ["SD1_512_768", "SD1_384_960"],
      landscape: ["SD1_768_512", "SD1_960_384"],
    },
    SD2: {
      square: ["SD2_768_768"],
      portrait: ["SD2_768_1200"],
      landscape: ["SD2_1200_768"],
    },
    SDXL: {
      square: ["SD3_1024_1024"],
      portrait: ["SD3_832_1216", "SD3_640_1536"],
      landscape: ["SD3_1216_832", "SD3_1536_640"],
    },
    FLUX: {
      square: ["SD4_896_896"],
      portrait: ["SD4_896_1152"],
      landscape: ["SD4_1152_896"],
    },
    SD5: {
      square: ["SD3_1024_1024"],
      portrait: ["SD3_832_1216"],
      landscape: ["SD3_1216_832"],
    },
    GEMINI: {
      square: ["SD3_1024_1024"],
      portrait: ["SD3_832_1216"],
      landscape: ["SD3_1216_832"],
    },
  }

  const options =
    sizeOptionsByModelType[props.modelType] ?? sizeOptionsByModelType.SDXL

  const getAllSizeTypesSorted = (): string[] => {
    const all = Array.from(
      new Set([...options.portrait, ...options.square, ...options.landscape]),
    )

    // 縦横比(横/縦)が小さいほど「縦」、大きいほど「横」に見える
    // 同率は面積（大きさ）で安定させる
    return all
      .map((sizeType) => {
        const s = parseGenerationSize(sizeType)
        const w = Math.round(s.width)
        const h = Math.round(s.height)
        const r = w / Math.max(1, h)
        const area = w * h
        return { sizeType, ratio: r, area }
      })
      .sort((a, b) => {
        if (a.ratio !== b.ratio) return a.ratio - b.ratio
        if (a.area !== b.area) return a.area - b.area
        return a.sizeType.localeCompare(b.sizeType)
      })
      .map((x) => x.sizeType)
  }

  const allSizeTypes = getAllSizeTypesSorted()
  const currentIndex = Math.max(0, allSizeTypes.indexOf(props.value))

  const sizeMetas = allSizeTypes.map((sizeType) => {
    const s = parseGenerationSize(sizeType)
    const w = Math.round(s.width)
    const h = Math.round(s.height)
    const r = w / Math.max(1, h)
    const area = w * h
    return { sizeType, width: w, height: h, ratio: r, area }
  })

  const currentMeta =
    sizeMetas[currentIndex] ??
    (sizeMetas.length > 0
      ? sizeMetas[0]
      : { sizeType: props.value, width: 0, height: 0, ratio: 1, area: 0 })

  const getAspectLabel = (r: number) => {
    // ざっくりした見た目分類（ラベル用途）
    if (r < 0.95) return t("縦", "Portrait")
    if (r > 1.05) return t("横", "Landscape")
    return t("正方形", "Square")
  }

  const pickSizeTypeByIndex = (nextIndex: number) => {
    if (allSizeTypes.length <= 0) return
    const safeIndex = Math.max(0, Math.min(nextIndex, allSizeTypes.length - 1))
    const next = allSizeTypes[safeIndex] ?? allSizeTypes[0]
    if (typeof next === "string") props.onChange(next)
  }

  const width = currentMeta.width
  const height = currentMeta.height
  const ratio = currentMeta.ratio

  const gcd = (a: number, b: number): number => {
    let x = Math.abs(a)
    let y = Math.abs(b)
    while (y !== 0) {
      const temp = x % y
      x = y
      y = temp
    }
    return x
  }

  const ratioGcd = gcd(width, height)
  const ratioText = `${Math.round(width / ratioGcd)} : ${Math.round(
    height / ratioGcd,
  )}`

  const previewRectStyle: React.CSSProperties = (() => {
    if (!Number.isFinite(ratio) || ratio <= 0) {
      return { width: "100%", height: "100%" }
    }
    if (ratio >= 1) {
      return { width: "100%", height: `${(1 / ratio) * 100}%` }
    }
    return { width: `${ratio * 100}%`, height: "100%" }
  })()

  const isDefaultSizeType = (() => {
    // 既存のデフォルト値に合わせる（SD1の初期値）
    if (props.modelType === "SD1") return props.value === "SD1_512_768"
    // 他モデルは「正方形」をデフォルト扱い
    const defaultSquare = options.square[0]
    return props.value === defaultSquare
  })()

  const resetSizeType = () => {
    if (props.modelType === "SD1") {
      props.onChange("SD1_512_768")
      return
    }
    const defaultSquare = options.square[0]
    if (typeof defaultSquare === "string") props.onChange(defaultSquare)
  }

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <span className="font-bold text-sm">{t("サイズ", "Size")}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          disabled={isDefaultSizeType}
          onClick={resetSizeType}
        >
          {t("リセット", "Reset")}
        </Button>
      </div>

      <div className="items-center gap-4">
        <div className="flex flex-1 flex-col gap-3">
          {/* One slider for all sizes */}
          {allSizeTypes.length > 1 ? (
            <div className="mr-4 space-y-1">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">{`${width}×${height}`}</span>
                  <span className="text-muted-foreground">{` (${getAspectLabel(ratio)})`}</span>
                </div>
              </div>
              <Slider
                value={[currentIndex]}
                min={0}
                max={Math.max(0, allSizeTypes.length - 1)}
                step={1}
                onValueChange={(v) => {
                  const nextIndex = v[0] ?? 0
                  pickSizeTypeByIndex(nextIndex)
                }}
                className="mt-4 mb-2"
              />
              {/* Tick marks (clickable) */}
              <div className="flex items-center justify-between gap-1 pt-1">
                {sizeMetas.map((m, i) => (
                  <button
                    key={m.sizeType}
                    type="button"
                    onClick={() => pickSizeTypeByIndex(i)}
                    className={
                      i === currentIndex
                        ? "h-2.5 w-2.5 rounded-full bg-primary"
                        : "h-2.5 w-2.5 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }
                    aria-label={`${m.width}x${m.height}`}
                    title={`${m.width}×${m.height}`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-muted-foreground text-xs">
                <span>{t("縦", "Portrait")}</span>
                <span>{t("正方形", "Square")}</span>
                <span>{t("横", "Landscape")}</span>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-xs">
              {t(
                "このモデルではサイズが1種類のみです",
                "Only one size is available for this model",
              )}
            </div>
          )}
        </div>
        {/* Visual preview */}
        <div className="m-auto mt-4 flex w-36 flex-col items-center gap-2">
          <div className="relative flex size-32 items-center justify-center rounded-xl border bg-muted/30">
            <div className="absolute inset-3 rounded-lg border border-muted-foreground/40 border-dashed" />
            <div
              className="flex items-center justify-center rounded-md border border-muted-foreground/50 bg-background/60"
              style={previewRectStyle}
            >
              <span className="font-semibold text-foreground/90 text-sm">
                {ratioText}
              </span>
            </div>
          </div>
          <div className="text-muted-foreground text-xs">{`${width}×${height}`}</div>
        </div>
      </div>
    </div>
  )
}
