import { useEffect, useRef, useState } from "react"

export type ChartSeries = {
  label: string
  color: string
  /** マイナスの値の色（収支など。無ければ color） */
  negativeColor?: string
  values: (number | null)[]
}

type Props = {
  labels: string[]
  series: ChartSeries[]
  /** 棒グラフ（日ごとの量）か折れ線（残高・人数） */
  type?: "line" | "bar"
  /** 系列を積み上げる（プラン別の会員数など） */
  stacked?: boolean
  format?: (value: number) => string
  /** 横軸と選んだ所の見出し（無ければ日付 2026-11-13 → 11/13）。月別のグラフで使う */
  formatLabel?: (label: string) => string
  height?: number
  /** 読み上げ用の説明 */
  title?: string
}

const DEFAULT_WIDTH = 720
/** これより狭いとき（スマホ）は余白と高さを詰める */
const NARROW_WIDTH = 480

/**
 * 依存なしの小さなグラフ（SVG）。マウスを乗せた日・指でなぞった日の値を下に出す（触っていないときは最新の日）
 * 表示幅をそのまま座標に使うので、スマホでも目盛りの文字が縮まない
 */
export function AnalyticsChart(props: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const update = () => {
      const next = Math.round(element.clientWidth)
      if (next > 0) setWidth(next)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const isNarrow = width < NARROW_WIDTH
  const padding = {
    top: 12,
    right: isNarrow ? 8 : 12,
    bottom: 24,
    left: isNarrow ? 40 : 56,
  }
  const height = props.height ?? (isNarrow ? 190 : 220)
  const format =
    props.format ?? ((value: number) => value.toLocaleString("ja-JP"))
  const formatLabel = props.formatLabel
  const [hover, setHover] = useState<number | null>(null)
  const count = props.labels.length
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom

  const totals = props.labels.map((_, index) =>
    props.series.reduce(
      (total, series) => total + (series.values[index] ?? 0),
      0,
    ),
  )
  const max = Math.max(
    1,
    ...(props.stacked
      ? totals
      : props.series.flatMap((series) =>
          series.values.map((value) => value ?? 0),
        )),
  )
  // マイナスがあるとき（収支など。積み上げでは使わない）は 0 より下も描く
  const min = props.stacked
    ? 0
    : Math.min(
        0,
        ...props.series.flatMap((series) =>
          series.values.map((value) => value ?? 0),
        ),
      )
  const niceMax = niceCeil(max)
  const niceMin = min < 0 ? -niceCeil(-min) : 0
  const x = (index: number) =>
    padding.left +
    (count <= 1 ? innerWidth / 2 : (index / (count - 1)) * innerWidth)
  const y = (value: number) =>
    padding.top +
    innerHeight -
    ((value - niceMin) / (niceMax - niceMin)) * innerHeight
  const barWidth = Math.max(1, (innerWidth / Math.max(count, 1)) * 0.7)
  const ticks =
    niceMin < 0
      ? [niceMin, niceMin / 2, 0, niceMax / 2, niceMax]
      : [0, 0.25, 0.5, 0.75, 1].map((rate) => niceMax * rate)
  // 日付の文字が重ならない数だけ出す
  const labelStep = Math.max(
    1,
    Math.ceil(count / Math.max(2, Math.floor(innerWidth / 52))),
  )

  const onMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const position = ((event.clientX - rect.left) / rect.width) * width
    const index = Math.round(
      ((position - padding.left) / innerWidth) * (count - 1),
    )
    setHover(Math.min(Math.max(index, 0), count - 1))
  }
  /** 値を出す日（触っていないときは最新の日） */
  const shown = hover ?? (count > 0 ? count - 1 : null)

  return (
    <div ref={containerRef} className="space-y-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full touch-pan-y select-none"
        style={{ height }}
        role="img"
        onPointerDown={onMove}
        onPointerMove={onMove}
        // 指を離したあとも選んだ日を残す（マウスは外れたら最新の日に戻す）
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") setHover(null)
        }}
      >
        <title>
          {props.title ?? props.series.map((series) => series.label).join("・")}
        </title>
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="currentColor"
              className="text-white/10"
            />
            <text
              x={padding.left - 6}
              y={y(tick) + 4}
              textAnchor="end"
              className="fill-slate-400 text-[10px]"
            >
              {compact(tick)}
            </text>
          </g>
        ))}
        {props.labels.map((label, index) =>
          index % labelStep === 0 ? (
            <text
              key={label}
              x={x(index)}
              y={height - 6}
              textAnchor="middle"
              className="fill-slate-400 text-[10px]"
            >
              {formatLabel ? formatLabel(label) : label.slice(5)}
            </text>
          ) : null,
        )}
        {props.type === "bar"
          ? props.labels.map((label, index) => {
              let base = 0
              return props.series.map((series) => {
                const value = series.values[index] ?? 0
                const top = props.stacked ? base + value : Math.max(value, 0)
                const bottom = props.stacked ? base : Math.min(value, 0)
                const rect = (
                  <rect
                    key={`${label}-${series.label}`}
                    x={x(index) - barWidth / 2}
                    y={y(top)}
                    width={barWidth}
                    height={Math.max(0, y(bottom) - y(top))}
                    fill={
                      value < 0 && series.negativeColor
                        ? series.negativeColor
                        : series.color
                    }
                    opacity={hover === null || hover === index ? 0.9 : 0.5}
                  />
                )
                if (props.stacked) base += value
                return rect
              })
            })
          : stackLines(props.series, props.stacked).map((series) => {
              const points = series.values.flatMap((value, index) =>
                value === null ? [] : [{ x: x(index), y: y(value) }],
              )
              // 1 日分しかないときは線にならないので点で出す（記録を始めたばかりの数字）
              return points.length === 1 ? (
                <circle
                  key={series.label}
                  cx={points[0].x}
                  cy={points[0].y}
                  r={3}
                  fill={series.color}
                />
              ) : (
                <polyline
                  key={series.label}
                  fill="none"
                  stroke={series.color}
                  strokeWidth={2}
                  points={points
                    .map((point) => `${point.x},${point.y}`)
                    .join(" ")}
                />
              )
            })}
        {hover !== null && (
          <line
            x1={x(hover)}
            x2={x(hover)}
            y1={padding.top}
            y2={padding.top + innerHeight}
            stroke="currentColor"
            className="text-white/30"
          />
        )}
      </svg>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-300 text-xs sm:gap-x-4">
        {shown !== null && (
          <span
            className={`w-full font-medium tabular-nums sm:w-auto ${hover === null ? "text-slate-400" : "text-slate-100"}`}
          >
            {formatLabel
              ? formatLabel(props.labels[shown] ?? "")
              : (props.labels[shown] ?? "").slice(5).replace("-", "/")}
            {hover === null && "（最新）"}
          </span>
        )}
        {props.series.map((series) => (
          <span key={series.label} className="flex items-center gap-1">
            <span
              className="inline-block size-2 shrink-0 rounded-full"
              style={{ background: series.color }}
            />
            {series.label}
            {shown !== null && (
              <span className="font-medium text-slate-100 tabular-nums">
                {series.values[shown] === null ||
                series.values[shown] === undefined
                  ? "-"
                  : format(series.values[shown] ?? 0)}
              </span>
            )}
          </span>
        ))}
        {shown !== null && props.stacked && (
          <span className="font-medium text-slate-100 tabular-nums">
            合計 {format(totals[shown] ?? 0)}
          </span>
        )}
      </div>
    </div>
  )
}

/** 積み上げの折れ線は、下の系列を足した位置に描く */
function stackLines(series: ChartSeries[], stacked?: boolean) {
  if (!stacked) return series
  const running: number[] = []
  return series.map((item) => ({
    ...item,
    values: item.values.map((value, index) => {
      if (value === null) return null
      running[index] = (running[index] ?? 0) + value
      return running[index]
    }),
  }))
}

function niceCeil(value: number) {
  const power = 10 ** Math.floor(Math.log10(value))
  for (const step of [1, 2, 2.5, 5, 10]) {
    if (value <= step * power) return step * power
  }
  return 10 * power
}

function compact(value: number): string {
  if (value < 0) return `-${compact(-value)}`
  if (value >= 1_000_000)
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  if (value >= 10_000) return `${(value / 1000).toFixed(0)}k`
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`
  return String(Math.round(value))
}
