import { useState } from "react"

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
  height?: number
  /** 読み上げ用の説明 */
  title?: string
}

const WIDTH = 720
const PADDING = { top: 12, right: 12, bottom: 24, left: 56 }

/**
 * 依存なしの小さなグラフ（SVG）。マウスを乗せた日の値を下に出す
 */
export function AnalyticsChart(props: Props) {
  const height = props.height ?? 220
  const format =
    props.format ?? ((value: number) => value.toLocaleString("ja-JP"))
  const [hover, setHover] = useState<number | null>(null)
  const count = props.labels.length
  const innerWidth = WIDTH - PADDING.left - PADDING.right
  const innerHeight = height - PADDING.top - PADDING.bottom

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
    PADDING.left +
    (count <= 1 ? innerWidth / 2 : (index / (count - 1)) * innerWidth)
  const y = (value: number) =>
    PADDING.top +
    innerHeight -
    ((value - niceMin) / (niceMax - niceMin)) * innerHeight
  const barWidth = Math.max(1, (innerWidth / Math.max(count, 1)) * 0.7)
  const ticks =
    niceMin < 0
      ? [niceMin, niceMin / 2, 0, niceMax / 2, niceMax]
      : [0, 0.25, 0.5, 0.75, 1].map((rate) => niceMax * rate)
  const labelStep = Math.max(1, Math.ceil(count / 8))

  const onMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const position = ((event.clientX - rect.left) / rect.width) * WIDTH
    const index = Math.round(
      ((position - PADDING.left) / innerWidth) * (count - 1),
    )
    setHover(Math.min(Math.max(index, 0), count - 1))
  }

  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="w-full"
        role="img"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <title>
          {props.title ?? props.series.map((series) => series.label).join("・")}
        </title>
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="currentColor"
              className="text-white/10"
            />
            <text
              x={PADDING.left - 6}
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
              {label.slice(5)}
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
          : stackLines(props.series, props.stacked).map((series) => (
              <polyline
                key={series.label}
                fill="none"
                stroke={series.color}
                strokeWidth={2}
                points={series.values
                  .map((value, index) =>
                    value === null ? null : `${x(index)},${y(value)}`,
                  )
                  .filter(Boolean)
                  .join(" ")}
              />
            ))}
        {hover !== null && (
          <line
            x1={x(hover)}
            x2={x(hover)}
            y1={PADDING.top}
            y2={PADDING.top + innerHeight}
            stroke="currentColor"
            className="text-white/30"
          />
        )}
      </svg>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300 text-xs">
        {hover !== null && (
          <span className="font-medium text-slate-100">
            {props.labels[hover]}
          </span>
        )}
        {props.series.map((series) => (
          <span key={series.label} className="flex items-center gap-1">
            <span
              className="inline-block size-2 rounded-full"
              style={{ background: series.color }}
            />
            {series.label}
            {hover !== null && (
              <span className="text-slate-100">
                {series.values[hover] === null
                  ? "-"
                  : format(series.values[hover] ?? 0)}
              </span>
            )}
          </span>
        ))}
        {hover !== null && props.stacked && (
          <span className="text-slate-100">
            合計 {format(totals[hover] ?? 0)}
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
