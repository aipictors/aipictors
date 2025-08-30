import { useEffect, useState } from "react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  scores: {
    cuteness: number
    coolness: number
    beauty: number
    originality: number
    composition: number
    color: number
    detail: number
    consistency: number
  }
  size?: number
  animate?: boolean
}

/**
 * AI評価レーダーチャート（アニメーション付き）
 */
export function AiEvaluationRadarChart(props: Props) {
  const [animatedScores, setAnimatedScores] = useState(
    Object.fromEntries(Object.keys(props.scores).map((key) => [key, 0])),
  )
  const [isVisible, setIsVisible] = useState(false)
  const t = useTranslation()
  const size = props.size || 240
  const center = size / 2
  const radius = size * 0.35

  // アニメーション効果
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const duration = 1500 // 1.5秒
    const steps = 60
    const stepDuration = duration / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const progress = Math.min(currentStep / steps, 1)

      // イージング関数（ease-out）
      const easedProgress = 1 - (1 - progress) ** 3

      setAnimatedScores(
        Object.fromEntries(
          Object.entries(props.scores).map(([key, value]) => [
            key,
            value * easedProgress,
          ]),
        ),
      )

      if (progress >= 1) {
        clearInterval(interval)
      }
    }, stepDuration)

    return () => clearInterval(interval)
  }, [isVisible, props.scores])

  const criteria = [
    { key: "cuteness", label: t("可愛さ", "Cuteness"), color: "#ff6b9d" },
    { key: "coolness", label: t("カッコよさ", "Coolness"), color: "#4dabf7" },
    { key: "beauty", label: t("美しさ", "Beauty"), color: "#69db7c" },
    { key: "originality", label: t("独創性", "Originality"), color: "#ffa726" },
    { key: "composition", label: t("構図", "Composition"), color: "#ab47bc" },
    { key: "color", label: t("色彩", "Color"), color: "#ef5350" },
    { key: "detail", label: t("細部", "Detail"), color: "#42a5f5" },
    { key: "consistency", label: t("一貫性", "Consistency"), color: "#66bb6a" },
  ]

  // ポイント座標計算
  const getPointCoordinates = (index: number, value: number) => {
    const angle = (index * 2 * Math.PI) / criteria.length - Math.PI / 2
    const distance = (value / 100) * radius
    return {
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
    }
  }

  // ラベル座標計算
  const getLabelCoordinates = (index: number) => {
    const angle = (index * 2 * Math.PI) / criteria.length - Math.PI / 2
    const distance = radius + 25
    return {
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
    }
  }

  // パスデータ生成
  const createPath = (scores: Record<string, number>) => {
    const points = criteria.map((criterion, index) => {
      const value = scores[criterion.key] || 0
      return getPointCoordinates(index, value)
    })

    if (points.length === 0) return ""

    const pathData = points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ")

    return `${pathData} Z`
  }

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width={size}
        height={size}
        className="transition-opacity duration-500"
        style={{ opacity: isVisible ? 1 : 0 }}
      >
        <title>
          {t("AI評価レーダーチャート", "AI Evaluation Radar Chart")}
        </title>

        {/* グリッド線 */}
        <g className="opacity-30">
          {[20, 40, 60, 80, 100].map((level) => (
            <polygon
              key={level}
              points={criteria
                .map((_, index) => {
                  const point = getPointCoordinates(index, level)
                  return `${point.x},${point.y}`
                })
                .join(" ")}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-slate-400"
            />
          ))}

          {/* 軸線 */}
          {criteria.map((_, index) => {
            const point = getPointCoordinates(index, 100)
            return (
              <line
                key={index}
                x1={center}
                y1={center}
                x2={point.x}
                y2={point.y}
                stroke="currentColor"
                strokeWidth="1"
                className="text-slate-400"
              />
            )
          })}
        </g>

        {/* データエリア（グラデーション付き） */}
        <defs>
          <radialGradient id="scoreGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.1" />
          </radialGradient>
        </defs>

        <path
          d={createPath(animatedScores)}
          fill="url(#scoreGradient)"
          stroke="#3b82f6"
          strokeWidth="2"
          className="transition-all duration-300"
        />

        {/* データポイント */}
        {criteria.map((criterion, index) => {
          const value = animatedScores[criterion.key] || 0
          const point = getPointCoordinates(index, value)

          return (
            <g key={criterion.key}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill={criterion.color}
                stroke="white"
                strokeWidth="2"
                className="transition-all duration-300 hover:r-6"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="8"
                fill={criterion.color}
                opacity="0.2"
                className="animate-pulse"
              />
            </g>
          )
        })}

        {/* ラベル */}
        {criteria.map((criterion, index) => {
          const point = getLabelCoordinates(index)
          const score = Math.round(animatedScores[criterion.key] || 0)

          return (
            <g key={`label-${criterion.key}`}>
              <text
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-slate-700 text-xs font-medium dark:fill-slate-300"
              >
                {criterion.label}
              </text>
              <text
                x={point.x}
                y={point.y + 12}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-slate-500 text-xs dark:fill-slate-400"
              >
                {score}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
