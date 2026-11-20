import { useState } from "react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

const numberFormat = new Intl.NumberFormat("ja-JP")

export const formatNumber = (value: number) => numberFormat.format(value)

/** 割合（0〜1）→「12.3%」 */
export const formatShare = (value: number) =>
  `${(value * 100).toFixed(value < 0.01 ? 2 : 1)}%`

const BAR_COLORS = [
  "from-fuchsia-500 to-pink-400",
  "from-violet-500 to-fuchsia-400",
  "from-indigo-500 to-violet-400",
  "from-sky-500 to-indigo-400",
  "from-cyan-500 to-sky-400",
  "from-emerald-500 to-cyan-400",
  "from-lime-500 to-emerald-400",
  "from-amber-500 to-lime-400",
  "from-orange-500 to-amber-400",
  "from-rose-500 to-orange-400",
]

export type ShareItem = { name: string; count: number; share: number }

/**
 * 横棒の割合グラフ（モデルの利用率など）
 */
export function ShareBars(props: {
  items: ShareItem[]
  unit?: string
  /** モデル名 → サムネイルの URL（あれば上位 3 つを大きく出し、各行にも小さく付ける） */
  thumbnails?: Record<string, string>
}) {
  const t = useTranslation()
  // 「その他」は大きすぎて棒の長さの基準をくずすので、棒にせず下に書く
  const ranked = props.items.filter((item) => item.name !== OTHER_NAME)
  const other = props.items.find((item) => item.name === OTHER_NAME)
  const max = Math.max(...ranked.map((item) => item.share), 0.0001)
  const thumbnails = props.thumbnails
  return (
    <div className="space-y-3">
      {thumbnails && (
        <TopThree items={ranked.slice(0, 3)} thumbnails={thumbnails} />
      )}
      <ol className="space-y-2">
        {ranked.map((item, index) => (
          <li
            key={item.name}
            className={cn(
              "grid items-center gap-2",
              thumbnails
                ? "grid-cols-[1.5rem_2.5rem_1fr]"
                : "grid-cols-[1.5rem_1fr]",
            )}
          >
            <span className="text-right font-bold text-muted-foreground text-xs tabular-nums">
              {index + 1}
            </span>
            {thumbnails && (
              <Thumb
                name={item.name}
                url={thumbnails[item.name]}
                className="size-10 rounded-lg"
              />
            )}
            <div className="min-w-0">
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="truncate font-medium">{item.name}</span>
                <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
                  {formatShare(item.share)}
                  <span className="ml-1 hidden sm:inline">
                    （{formatNumber(item.count)}
                    {props.unit ?? ""}）
                  </span>
                </span>
              </div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r",
                    BAR_COLORS[index % BAR_COLORS.length],
                  )}
                  style={{ width: `${Math.max(1, (item.share / max) * 100)}%` }}
                />
              </div>
            </div>
          </li>
        ))}
      </ol>
      {other && (
        <p className="text-muted-foreground text-xs">
          {t("その他", "Others")} {formatShare(other.share)}（
          {formatNumber(other.count)}
          {props.unit ?? ""}）
        </p>
      )}
    </div>
  )
}

const OTHER_NAME = "その他"

const MEDALS = ["🥇", "🥈", "🥉"]

/** 上位 3 つのモデルを大きなサムネイルで並べる */
function TopThree(props: {
  items: ShareItem[]
  thumbnails: Record<string, string>
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {props.items.map((item, index) => (
        <div
          key={item.name}
          className="relative overflow-hidden rounded-xl border bg-muted"
        >
          <Thumb
            name={item.name}
            url={props.thumbnails[item.name]}
            className="aspect-square w-full"
            textClassName="text-3xl"
          />
          <span className="absolute top-1 left-1 text-xl drop-shadow">
            {MEDALS[index]}
          </span>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6 text-white">
            <div className="truncate font-bold text-xs">{item.name}</div>
            <div className="font-black text-lg tabular-nums leading-none">
              {formatShare(item.share)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/** サムネイル。画像がないものは頭文字を色付きの四角に出す */
export function Thumb(props: {
  name: string
  url: string | undefined
  className?: string
  textClassName?: string
}) {
  if (props.url) {
    return (
      <img
        src={props.url}
        alt={props.name}
        loading="lazy"
        className={cn("bg-muted object-cover", props.className)}
      />
    )
  }
  const hue =
    [...props.name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360
  return (
    <div
      aria-hidden
      className={cn(
        "flex items-center justify-center font-black text-white",
        props.className,
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 50) % 360} 70% 45%))`,
      }}
    >
      <span className={props.textClassName}>
        {[...props.name][0]?.toUpperCase()}
      </span>
    </div>
  )
}

/**
 * タブで切り替える横棒グラフ
 */
export function ShareBarsTabs(props: {
  tabs: { key: string; label: string; items: ShareItem[] }[]
  unit?: string
  thumbnails?: Record<string, string>
}) {
  const [selected, setSelected] = useState(props.tabs[0]?.key ?? "")
  const current =
    props.tabs.find((tab) => tab.key === selected) ?? props.tabs[0]
  if (current === undefined) return null
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {props.tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSelected(tab.key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition",
              tab.key === current.key
                ? "border-transparent bg-gradient-to-r from-fuchsia-600 to-pink-500 font-bold text-white"
                : "hover:bg-muted",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <ShareBars
        items={current.items}
        unit={props.unit}
        thumbnails={props.thumbnails}
      />
    </div>
  )
}

export type MonthlyPoint = { month: string; value: number }

/** 月ごとの数 → その月までの累計 */
export const toCumulative = (points: MonthlyPoint[]): MonthlyPoint[] => {
  let total = 0
  return points.map((point) => {
    total += point.value
    return { month: point.month, value: total }
  })
}

/**
 * 月ごとの累計の縦棒。年の境目に目盛りを付ける
 */
export function MonthlyBars(props: {
  /** 月ごとの数（中で累計にする） */
  points: MonthlyPoint[]
  colorClassName: string
  unit?: string
}) {
  const t = useTranslation()
  const [hovered, setHovered] = useState<MonthlyPoint | null>(null)
  const points = toCumulative(props.points)
  const max = Math.max(...points.map((point) => point.value), 1)
  const shown = hovered ?? points[points.length - 1] ?? null
  return (
    <div>
      <div className="mb-2 h-5 text-muted-foreground text-xs">
        {shown && (
          <>
            <span className="font-bold text-foreground">
              {shown.month.replace("-", "年")}
              {t("月まで", "")}
            </span>{" "}
            {t("累計", "Total")} {formatNumber(shown.value)}
            {props.unit ?? ""}
          </>
        )}
      </div>
      <div
        className="flex h-40 items-end gap-px"
        onMouseLeave={() => setHovered(null)}
      >
        {points.map((point) => (
          <button
            key={point.month}
            type="button"
            aria-label={`${point.month} ${point.value}`}
            onMouseEnter={() => setHovered(point)}
            onFocus={() => setHovered(point)}
            onClick={() => setHovered(point)}
            className={cn(
              "relative min-w-0 flex-1 rounded-t-sm bg-gradient-to-t transition-opacity",
              props.colorClassName,
              hovered !== null && hovered.month !== point.month && "opacity-50",
            )}
            style={{ height: `${Math.max(1, (point.value / max) * 100)}%` }}
          />
        ))}
      </div>
      <div className="mt-1 flex gap-px text-[10px] text-muted-foreground">
        {points.map((point) => (
          <span key={point.month} className="min-w-0 flex-1 overflow-visible">
            {point.month.endsWith("-01") ? point.month.slice(0, 4) : ""}
          </span>
        ))}
      </div>
    </div>
  )
}

const WEEKDAYS = {
  ja: ["日", "月", "火", "水", "木", "金", "土"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
}

/**
 * 曜日 × 時間帯のヒートマップ（JST、values[曜日 0=日][時 0〜23]）
 */
export function WeekHourHeatmap(props: { values: number[][] }) {
  const t = useTranslation()
  // 予約投稿の既定の 0 時に集まって他が見えなくなるので、上位 3% は同じ濃さにする
  const sorted = props.values.flat().sort((a, b) => a - b)
  const max = Math.max(sorted[Math.floor(sorted.length * 0.97)] ?? 1, 1)
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        <div className="grid grid-cols-[2.5rem_repeat(24,1fr)] gap-0.5">
          <span />
          {Array.from({ length: 24 }, (_, hour) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: 時間は固定の 24 列
              key={hour}
              className="text-center text-[10px] text-muted-foreground"
            >
              {hour % 3 === 0 ? hour : ""}
            </span>
          ))}
          {props.values.map((row, weekday) => (
            <div key={WEEKDAYS.ja[weekday]} className="contents">
              <span className="pr-1 text-right text-muted-foreground text-xs leading-5">
                {t(WEEKDAYS.ja[weekday] ?? "", WEEKDAYS.en[weekday] ?? "")}
              </span>
              {row.map((value, hour) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: 時間は固定の 24 列
                  key={hour}
                  title={`${WEEKDAYS.ja[weekday]} ${hour}:00 ${formatNumber(value)}`}
                  className="h-5 rounded-sm bg-fuchsia-500"
                  style={{
                    opacity: 0.08 + Math.min(1, value / max) * 0.92,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * 1 本の帯で割合を見せる（年齢区分・国など）
 */
export function StackedShare(props: {
  items: { label: string; share: number; className: string }[]
}) {
  return (
    <div className="space-y-2">
      <div className="flex h-4 overflow-hidden rounded-full">
        {props.items.map((item) => (
          <div
            key={item.label}
            className={item.className}
            style={{ width: `${item.share * 100}%` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {props.items.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span className={cn("size-2.5 rounded-full", item.className)} />
            {item.label}
            <span className="text-muted-foreground tabular-nums">
              {formatShare(item.share)}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
