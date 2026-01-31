import { Cloud } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { Link, useLocation } from "@remix-run/react"
import { useMemo } from "react"
import type { RecommendedTag } from "~/routes/($lang)._main.tags._index/types/tag"

type Props = {
  tags: RecommendedTag[]
}

export function TagCloudSection ({ tags }: Props) {
  const t = useTranslation()
  const location = useLocation()
  const isR18Mode = location.pathname.includes("/r/tags")

  // タグクラウド用のタグを厳選（12個に減らして整理された見た目に）
  const cloudTags = tags.slice(0, 12)

  // 組織化された配置のための位置とスタイル計算
  const tagElements = useMemo(() => {
    // 円形の整理された配置
    const positions = [
      // 中心上部
      { x: 50, y: 20 },
      // 時計回りの配置（外側の円）
      { x: 70, y: 25 },
      { x: 85, y: 45 },
      { x: 85, y: 65 },
      { x: 70, y: 85 },
      { x: 50, y: 90 },
      { x: 30, y: 85 },
      { x: 15, y: 65 },
      { x: 15, y: 45 },
      { x: 30, y: 25 },
      // 内側の円（2個）
      { x: 40, y: 55 },
      { x: 60, y: 55 },
    ]

    return cloudTags.map((tag, index) => {
      const position = positions[index] || { x: 50, y: 50 }

      // 統一されたサイズで重要度に基づく小さな変動
      const sizeVariations = [100, 85, 90, 95, 85, 80, 95, 90, 85, 80, 105, 100]
      const circleSize = sizeVariations[index] || 85

      // 統一された文字サイズ
      const fontSize = circleSize > 100 ? 14 : 12

      // 洗練されたパステルカラーパレット（ダークモード対応）
      const colors = [
        "bg-rose-50 text-rose-600 border border-rose-200/50 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700/50",
        "bg-sky-50 text-sky-600 border border-sky-200/50 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700/50",
        "bg-emerald-50 text-emerald-600 border border-emerald-200/50 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50",
        "bg-amber-50 text-amber-600 border border-amber-200/50 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50",
        "bg-violet-50 text-violet-600 border border-violet-200/50 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700/50",
        "bg-orange-50 text-orange-600 border border-orange-200/50 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700/50",
        "bg-cyan-50 text-cyan-600 border border-cyan-200/50 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700/50",
        "bg-pink-50 text-pink-600 border border-pink-200/50 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700/50",
        "bg-indigo-50 text-indigo-600 border border-indigo-200/50 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700/50",
        "bg-teal-50 text-teal-600 border border-teal-200/50 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700/50",
        "bg-lime-50 text-lime-600 border border-lime-200/50 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-700/50",
        "bg-purple-50 text-purple-600 border border-purple-200/50 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/50",
      ]

      return {
        tag,
        position,
        size: circleSize,
        fontSize,
        color: colors[index % colors.length],
        animationDelay: index * 0.1,
      }
    })
  }, [cloudTags])

  return (
    <section className="space-y-8">
      {/* セクションヘッダー - よりミニマルに */}
      <div className="space-y-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <Cloud className="h-6 w-6 text-blue-500" />{" "}
          <h2 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-semibold text-2xl text-transparent dark:from-blue-400 dark:to-purple-400">
            {t("タグクラウド", "Tag Cloud")}
          </h2>
        </div>
        <p className="text-muted-foreground text-sm">
          {t("人気のタグを見つけよう", "Discover popular tags")}
        </p>
      </div>

      {/* タグクラウド - クリーンな円形配置 */}
      <div className="relative mx-auto max-w-2xl">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm dark:from-gray-900/50 dark:to-gray-800/50">
          {/* 背景装飾 */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-blue-900/20 dark:to-purple-900/20" />

          {/* タグクラウド配置 */}
          <div className="relative h-full">
            {tagElements.map((element, index) => (
              <div
                key={`${element.tag.tagName}-${index}`}
                className="absolute animate-fade-in transition-all duration-300 ease-out"
                style={{
                  left: `${element.position.x}%`,
                  top: `${element.position.y}%`,
                  transform: "translate(-50%, -50%)",
                  animationDelay: `${element.animationDelay}s`,
                }}
              >
                <Link
                  to={
                    isR18Mode
                      ? `/r/tags/${element.tag.tagName}`
                      : `/tags/${element.tag.tagName}`
                  }
                  className="block"
                >
                  <div
                    className={`group relative flex cursor-pointer items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition-colors duration-200 hover:shadow-md ${element.color}`}
                    style={{
                      width: `${element.size}px`,
                      height: `${element.size}px`,
                    }}
                  >
                    {/* タグテキスト */}
                    <span
                      className="relative z-10 select-none px-2 text-center font-medium leading-tight"
                      style={{ fontSize: `${element.fontSize}px` }}
                    >
                      {element.tag.tagName}
                    </span>

                    {/* ホバー効果 - スケールなしのエフェクト */}
                    <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-white/10" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
