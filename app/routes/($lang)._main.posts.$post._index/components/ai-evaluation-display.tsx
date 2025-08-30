import { BarChart3, Clock, EyeOff } from "lucide-react"
import { Card, CardContent } from "~/components/ui/card"
import { AiEvaluationRadarChart } from "~/routes/($lang)._main.posts.$post._index/components/ai-evaluation-radar-chart"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"

type BotEvaluation = {
  cutenessScore: number | null
  coolnessScore: number | null
  beautyScore: number | null
  originalityScore: number | null
  compositionScore: number | null
  colorScore: number | null
  detailScore: number | null
  consistencyScore: number | null
  overallScore: number | null
  comment: string | null
  personality: string | null
}

type Props = {
  evaluation: BotEvaluation | null
  personality?: string | null
  isVisible: boolean
  isBotGradingEnabled: boolean
  isBotGradingPublic: boolean
  isOwner?: boolean
}

/**
 * AI評価表示コンポーネント（吹き出しデザイン）
 */
export function AiEvaluationDisplay(props: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const t = useTranslation()

  // 表示しない場合
  if (!props.isVisible) {
    return null
  }

  // 非公開だが投稿者の場合の表示
  if (!props.isBotGradingPublic && props.isOwner) {
    return (
      <div className="w-full max-w-2xl">
        <Card className="border-amber-300 border-dashed bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <EyeOff className="h-5 w-5 text-amber-600" />
              <div>
                <h3 className="font-medium text-amber-800 text-sm dark:text-amber-200">
                  {t(
                    "AI評価は非公開設定です",
                    "AI evaluation is set to private",
                  )}
                </h3>
                <p className="text-amber-700 text-xs dark:text-amber-300">
                  {t(
                    "他のユーザーには表示されません",
                    "Not visible to other users",
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 評価が公開だが、まだ評価がない場合（評価中）
  if (
    props.isBotGradingEnabled &&
    props.isBotGradingPublic &&
    !props.evaluation
  ) {
    return (
      <div className="w-full max-w-2xl">
        <Card className="border-blue-300 border-dashed bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 animate-spin text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-800 text-sm dark:text-blue-200">
                  {t("AI評価を生成中です", "AI evaluation is being generated")}
                </h3>
                <p className="text-blue-700 text-xs dark:text-blue-300">
                  {t("しばらくお待ちください", "Please wait a moment")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 評価がない場合は非表示
  if (!props.evaluation) {
    return null
  }

  const hasScores =
    props.evaluation.cutenessScore !== null ||
    props.evaluation.coolnessScore !== null ||
    props.evaluation.beautyScore !== null ||
    props.evaluation.originalityScore !== null ||
    props.evaluation.compositionScore !== null ||
    props.evaluation.colorScore !== null ||
    props.evaluation.detailScore !== null ||
    props.evaluation.consistencyScore !== null

  if (!hasScores && !props.evaluation.comment) {
    return null
  }

  const scores = {
    cuteness: props.evaluation.cutenessScore ?? 0,
    coolness: props.evaluation.coolnessScore ?? 0,
    beauty: props.evaluation.beautyScore ?? 0,
    originality: props.evaluation.originalityScore ?? 0,
    composition: props.evaluation.compositionScore ?? 0,
    color: props.evaluation.colorScore ?? 0,
    detail: props.evaluation.detailScore ?? 0,
    consistency: props.evaluation.consistencyScore ?? 0,
  }

  const overallScore = props.evaluation.overallScore

  const getPersonalityAvatar = (personality?: string | null) => {
    switch (personality) {
      case "female":
        return {
          type: "image",
          value: "https://assets.aipictors.com/girl-icon_11zon.webp",
          bg: "from-pink-500 to-rose-500",
        }
      case "male":
        return {
          type: "image",
          value: "https://assets.aipictors.com/man-icon_11zon.webp",
          bg: "from-blue-500 to-indigo-500",
        }
      case "robot":
        return {
          type: "image",
          value: "https://assets.aipictors.com/robot-icon_11zon.webp",
          bg: "from-gray-500 to-slate-500",
        }
      case "sage":
        return {
          type: "image",
          value: "https://assets.aipictors.com/kenjin-icon_11zon.webp",
          bg: "from-purple-500 to-indigo-500",
        }
      case "pictor_chan":
        return {
          type: "image",
          value: "https://assets.aipictors.com/pictorchan-icon_11zon.webp",
          bg: "from-amber-500 to-orange-500",
        }
      default:
        return {
          type: "image",
          value: "https://assets.aipictors.com/robot-icon_11zon.webp",
          bg: "from-blue-500 to-purple-600",
        }
    }
  }

  const getPersonalityName = (personality?: string | null) => {
    switch (personality) {
      case "pictor_chan":
        return t("ぴくたーちゃん", "Pictor-chan")
      default:
        return "AI"
    }
  }

  const avatarData = getPersonalityAvatar(props.personality)

  return (
    <div className="w-full max-w-2xl">
      {/* キャラクターアバターと吹き出し */}
      <div className="relative flex items-start gap-4">
        {/* キャラクターアバター */}
        <div className="flex-shrink-0">
          <div className="relative flex flex-col items-center">
            <div
              className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-br shadow-lg ${avatarData.bg}`}
            >
              {avatarData.type === "image" ? (
                <img
                  src={avatarData.value}
                  alt={getPersonalityName(props.personality)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl">{avatarData.value}</span>
              )}
            </div>
            {/* オンラインインジケーター */}
            <div className="-bottom-1 -right-1 absolute h-4 w-4 animate-pulse rounded-full border-2 border-white bg-green-500" />
            {/* キャラクター名 */}
            <span className="mt-2 font-medium text-slate-700 text-xs dark:text-slate-300">
              {getPersonalityName(props.personality)}
            </span>
          </div>
        </div>

        {/* 吹き出し */}
        <div className="flex-1">
          <Card className="relative border-none bg-gradient-to-br from-white to-slate-50 shadow-xl dark:from-slate-800 dark:to-slate-900">
            {/* 吹き出しの三角形 */}
            <div className="-left-3 absolute top-6 h-0 w-0 border-t-[12px] border-t-transparent border-r-[12px] border-r-white border-b-[12px] border-b-transparent dark:border-r-slate-800" />

            <CardContent className="p-2">
              {/* コメント */}
              {props.evaluation.comment && (
                <div className="mb-6">
                  <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 dark:border-slate-700 dark:from-slate-900/50 dark:to-slate-800/50">
                    <p className="text-slate-700 text-sm leading-relaxed dark:text-slate-300">
                      {props.evaluation.comment}
                    </p>
                  </div>
                </div>
              )}

              {/* 詳細表示ボタン */}
              {hasScores && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="group h-10 w-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 transition-all duration-200 hover:from-blue-100 hover:to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50"
                >
                  <BarChart3 className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  {isExpanded
                    ? t("詳細スコアを閉じる", "Hide Detailed Scores")
                    : t("詳細スコアを見る", "View Detailed Scores")}
                </Button>
              )}

              {/* 展開時のレーダーチャート */}
              {isExpanded && hasScores && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 p-6 dark:border-slate-700 dark:from-slate-800 dark:to-blue-900/20">
                  <div className="mb-4 flex items-center justify-center gap-2">
                    <h4 className="font-medium text-slate-800 text-sm dark:text-slate-200">
                      詳細評価スコア
                    </h4>
                    {overallScore && (
                      <span className="text-slate-600 text-sm dark:text-slate-400">
                        (総合 {overallScore}点)
                      </span>
                    )}
                  </div>
                  <div className="flex justify-center">
                    <AiEvaluationRadarChart
                      scores={scores}
                      size={320}
                      animate={true}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
