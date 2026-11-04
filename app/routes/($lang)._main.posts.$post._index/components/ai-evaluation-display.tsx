import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import {
  ChevronDown,
  ChevronUp,
  EyeOff,
  Loader2,
  MessageSquare,
  RotateCcw,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { AiEvaluationRadarChart } from "~/routes/($lang)._main.posts.$post._index/components/ai-evaluation-radar-chart"

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
  workId: string
  /** 評価がないときの状況（FAILED: 何度か試してもできなかった / REFUSED: 内容を理由に評価しなかった） */
  status?: string | null
}

/** 作成中のあいだ、結果が出たか見に行く間隔 */
const POLL_INTERVAL_MS = 15_000

/** これより長いコメントは途中まで出す */
const COMMENT_FOLD_LENGTH = 120
const COMMENT_PREVIEW_LENGTH = 100

const getAiEvaluationHiddenKey = (workId: string) =>
  `ai-evaluation-hidden-${workId}`

const loadAiEvaluationHidden = (workId: string): boolean => {
  try {
    return localStorage.getItem(getAiEvaluationHiddenKey(workId)) === "true"
  } catch {
    return false
  }
}

const saveAiEvaluationHidden = (workId: string, hidden: boolean): void => {
  try {
    localStorage.setItem(getAiEvaluationHiddenKey(workId), hidden.toString())
  } catch {
    // LocalStorage書き込みに失敗した場合は無視
  }
}

const AVATARS: Record<string, string> = {
  female: "/images/ai-avatars/girl-128.webp",
  male: "/images/ai-avatars/man-128.webp",
  robot: "/images/ai-avatars/robot-128.webp",
  sage: "/images/ai-avatars/sage-128.webp",
  pictor_chan: "/images/ai-avatars/pictor-chan-128.webp",
}

/** 総合点の言葉と色（点数の目安は採点の基準と揃える） */
const toScoreBand = (score: number) => {
  if (score >= 90)
    return {
      ja: "圧巻",
      en: "Outstanding",
      ring: "#d946ef",
      text: "text-fuchsia-600 dark:text-fuchsia-400",
    }
  if (score >= 80)
    return {
      ja: "とても良い",
      en: "Excellent",
      ring: "#f59e0b",
      text: "text-amber-600 dark:text-amber-400",
    }
  if (score >= 70)
    return {
      ja: "良い",
      en: "Great",
      ring: "#10b981",
      text: "text-emerald-600 dark:text-emerald-400",
    }
  if (score >= 60)
    return {
      ja: "いい感じ",
      en: "Good",
      ring: "#0ea5e9",
      text: "text-sky-600 dark:text-sky-400",
    }
  return {
    ja: "伸びしろあり",
    en: "Room to grow",
    ring: "#94a3b8",
    text: "text-slate-600 dark:text-slate-300",
  }
}

function ScoreRing(props: { score: number }) {
  const band = toScoreBand(props.score)
  const radius = 26
  const circumference = 2 * Math.PI * radius
  return (
    <div className="relative size-16 shrink-0">
      <svg
        aria-hidden="true"
        viewBox="0 0 64 64"
        className="-rotate-90 size-full"
      >
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth="6"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={band.ring}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={
            circumference * (1 - Math.min(100, props.score) / 100)
          }
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-black text-xl tabular-nums">
        {props.score}
      </span>
    </div>
  )
}

function ScoreBar(props: { label: string; score: number }) {
  return (
    <div className="grid grid-cols-[5rem_1fr_2rem] items-center gap-2 text-xs">
      <span className="truncate text-muted-foreground">{props.label}</span>
      <span className="h-1.5 overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full rounded-full bg-primary/70"
          style={{ width: `${Math.min(100, props.score)}%` }}
        />
      </span>
      <span className="text-right font-medium tabular-nums">{props.score}</span>
    </div>
  )
}

/** できなかったAI評価のやり直し（作者のみ） */
function AiEvaluationRetryButton(props: {
  workId: string
  onRetried: () => void
}) {
  const t = useTranslation()
  const [retry, { loading: isRetrying }] = useMutation(
    retryWorkBotGradingMutation,
  )
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={isRetrying}
      onClick={async () => {
        try {
          await retry({ variables: { workId: props.workId } })
          props.onRetried()
        } catch {
          toast(
            t(
              "やり直しに失敗しました。時間をおいてお試しください",
              "Could not retry. Please try again later.",
            ),
          )
        }
      }}
    >
      {isRetrying ? (
        <Loader2 className="mr-1.5 size-4 animate-spin" />
      ) : (
        <RotateCcw className="mr-1.5 size-4" />
      )}
      {t("やり直す", "Retry")}
    </Button>
  )
}

/**
 * AI評価（総合点・作品へのコメント・項目ごとの点）
 */
export function AiEvaluationDisplay(props: Props) {
  const t = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [isCommentExpanded, setIsCommentExpanded] = useState(false)

  useEffect(() => {
    setIsHidden(loadAiEvaluationHidden(props.workId))
  }, [props.workId])

  const canView =
    props.isVisible &&
    props.isBotGradingEnabled &&
    (props.isBotGradingPublic || props.isOwner === true)

  // 作成中は結果が出るまで見に行く（再読み込みしなくても出るように）
  const isPending =
    canView &&
    props.evaluation === null &&
    props.status !== "FAILED" &&
    props.status !== "REFUSED"
  const { data: latest, refetch } = useQuery(aiEvaluationStatusQuery, {
    skip: !isPending || typeof window === "undefined",
    pollInterval: POLL_INTERVAL_MS,
    fetchPolicy: "network-only",
    errorPolicy: "ignore",
    variables: { id: props.workId },
  })

  const [isRetried, setIsRetried] = useState(false)

  if (!canView) {
    return null
  }

  const evaluation = props.evaluation ?? latest?.work?.botEvaluation ?? null
  const status = isRetried
    ? "PENDING"
    : (latest?.work?.botEvaluationStatus ?? props.status)
  const personality = props.personality ?? evaluation?.personality ?? null

  const name =
    personality === "pictor_chan" ? t("ぴくたーちゃん", "Pictor-chan") : "AI"
  const avatar = AVATARS[personality ?? ""] ?? AVATARS.robot

  if (isHidden) {
    return (
      <div className="w-full max-w-2xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsHidden(false)
            saveAiEvaluationHidden(props.workId, false)
          }}
          data-testid="ai-evaluation-reopen-button"
          className="text-muted-foreground"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          {t("AI評価を表示", "Show AI Evaluation")}
        </Button>
      </div>
    )
  }

  if (evaluation === null) {
    // 内容を理由に評価しなかったものは、作者にも何も出さない
    if (status === "REFUSED") return null

    if (status === "FAILED") {
      // 見ている人には関係のない失敗なので、作者にだけ伝える
      if (!props.isOwner) return null
      return (
        <div className="flex w-full max-w-2xl flex-wrap items-center gap-3 rounded-2xl border border-dashed p-4">
          <TriangleAlert className="size-5 shrink-0 text-amber-500" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm">
              {t(
                "この作品はAI評価できませんでした",
                "This work could not be evaluated",
              )}
            </p>
            <p className="text-muted-foreground text-xs">
              {t(
                "何度か試しましたが、AIが評価を返しませんでした。内容によっては評価できないことがあります。",
                "We tried several times, but the AI did not return an evaluation. Some content cannot be evaluated.",
              )}
            </p>
          </div>
          <AiEvaluationRetryButton
            workId={props.workId}
            onRetried={() => {
              setIsRetried(true)
              void refetch()
            }}
          />
        </div>
      )
    }

    if (!props.isBotGradingPublic && props.isOwner) {
      return (
        <div className="flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-dashed p-4">
          <EyeOff className="size-5 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium text-sm">
              {t("AI評価は非公開設定です", "AI evaluation is set to private")}
            </p>
            <p className="text-muted-foreground text-xs">
              {t(
                "他のユーザーには表示されません",
                "Not visible to other users",
              )}
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-dashed p-4">
        <Loader2 className="size-5 shrink-0 animate-spin text-primary" />
        <div>
          <p className="font-medium text-sm">
            {t("AI評価を生成中です", "AI evaluation is being generated")}
          </p>
          <p className="text-muted-foreground text-xs">
            {t(
              "混み合っているときは数分かかることがあります。できあがるとここに表示します",
              "This can take a few minutes when busy. It will appear here when ready.",
            )}
          </p>
        </div>
      </div>
    )
  }

  const qualityScores = [
    {
      key: "composition",
      label: t("構図", "Composition"),
      score: evaluation.compositionScore,
    },
    { key: "color", label: t("色彩", "Color"), score: evaluation.colorScore },
    {
      key: "detail",
      label: t("細部", "Detail"),
      score: evaluation.detailScore,
    },
    {
      key: "beauty",
      label: t("美しさ", "Beauty"),
      score: evaluation.beautyScore,
    },
    {
      key: "originality",
      label: t("独創性", "Originality"),
      score: evaluation.originalityScore,
    },
    {
      key: "consistency",
      label: t("一貫性", "Consistency"),
      score: evaluation.consistencyScore,
    },
  ].flatMap((item) =>
    item.score === null ? [] : [{ ...item, score: item.score }],
  )
  const styleScores = [
    {
      key: "cuteness",
      label: t("可愛さ", "Cuteness"),
      score: evaluation.cutenessScore,
    },
    {
      key: "coolness",
      label: t("かっこよさ", "Coolness"),
      score: evaluation.coolnessScore,
    },
  ].flatMap((item) =>
    item.score === null ? [] : [{ ...item, score: item.score }],
  )

  const hasScores = qualityScores.length > 0 || styleScores.length > 0

  if (!hasScores && !evaluation.comment) {
    return null
  }

  const overallScore = evaluation.overallScore
  const band = overallScore === null ? null : toScoreBand(overallScore)
  const strengths = [...qualityScores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
  const comment = evaluation.comment
  const isCommentLong = comment !== null && comment.length > COMMENT_FOLD_LENGTH

  return (
    <section
      aria-label={t("AI評価", "AI evaluation")}
      className="relative w-full max-w-2xl rounded-2xl border bg-card p-4"
    >
      <button
        type="button"
        onClick={() => {
          setIsHidden(true)
          saveAiEvaluationHidden(props.workId, true)
        }}
        data-testid="ai-evaluation-close-button"
        className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={t("AI評価を閉じる", "Close AI evaluation")}
      >
        <X className="size-4" />
      </button>

      <div className="flex items-center gap-3 pr-7">
        {overallScore !== null ? (
          <ScoreRing score={overallScore} />
        ) : (
          <img
            src={avatar}
            alt=""
            className="size-12 shrink-0 rounded-full object-cover"
            width={48}
            height={48}
            loading="lazy"
            decoding="async"
          />
        )}
        <div className="min-w-0 space-y-1">
          <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Sparkles className="size-3.5" />
            {t("AI評価", "AI evaluation")}
          </p>
          {band && (
            <p className={cn("font-bold text-base leading-tight", band.text)}>
              {t(band.ja, band.en)}
            </p>
          )}
          {strengths.length > 0 && (
            <p className="flex flex-wrap gap-1">
              {strengths.map((item) => (
                <span
                  key={item.key}
                  className="rounded-full bg-muted px-2 py-0.5 text-[11px] leading-4"
                >
                  {t(
                    `${item.label}が光る`,
                    `Strong ${item.label.toLowerCase()}`,
                  )}
                </span>
              ))}
            </p>
          )}
        </div>
      </div>

      {comment && (
        <div className="mt-3 flex items-start gap-2.5">
          <img
            src={avatar}
            alt=""
            className="size-8 shrink-0 rounded-full object-cover"
            width={32}
            height={32}
            loading="lazy"
            decoding="async"
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-xs">{name}</p>
            <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed">
              {isCommentLong && !isCommentExpanded
                ? `${comment.substring(0, COMMENT_PREVIEW_LENGTH)}…`
                : comment}
            </p>
            {isCommentLong && (
              <button
                type="button"
                onClick={() => setIsCommentExpanded((value) => !value)}
                className="mt-1 flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground"
              >
                {isCommentExpanded ? (
                  <ChevronUp className="size-3" />
                ) : (
                  <ChevronDown className="size-3" />
                )}
                {isCommentExpanded
                  ? t("閉じる", "Close")
                  : t("もっと見る", "Show more")}
              </button>
            )}
          </div>
        </div>
      )}

      {hasScores && (
        <>
          <button
            type="button"
            onClick={() => setIsExpanded((value) => !value)}
            aria-expanded={isExpanded}
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
          >
            {isExpanded ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
            {isExpanded
              ? t("項目ごとの点を閉じる", "Hide scores")
              : t("項目ごとの点を見る", "View scores")}
          </button>

          {isExpanded && (
            <div className="mt-2 grid items-center gap-4 border-t pt-3 sm:grid-cols-[1fr_minmax(0,240px)]">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  {qualityScores.map((item) => (
                    <ScoreBar
                      key={item.key}
                      label={item.label}
                      score={item.score}
                    />
                  ))}
                </div>
                {styleScores.length > 0 && (
                  <div className="space-y-1.5 border-t pt-3">
                    <p className="text-[11px] text-muted-foreground">
                      {t(
                        "作風の傾向（高いほど良いわけではありません）",
                        "Style tendency (higher is not necessarily better)",
                      )}
                    </p>
                    {styleScores.map((item) => (
                      <ScoreBar
                        key={item.key}
                        label={item.label}
                        score={item.score}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="mx-auto w-full max-w-[240px]">
                <AiEvaluationRadarChart
                  animate={true}
                  scores={{
                    cuteness: evaluation.cutenessScore ?? 0,
                    coolness: evaluation.coolnessScore ?? 0,
                    beauty: evaluation.beautyScore ?? 0,
                    originality: evaluation.originalityScore ?? 0,
                    composition: evaluation.compositionScore ?? 0,
                    color: evaluation.colorScore ?? 0,
                    detail: evaluation.detailScore ?? 0,
                    consistency: evaluation.consistencyScore ?? 0,
                  }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground sm:col-span-2">
                {t(
                  "AIが画像から判断した目安で、作品の価値を決めるものではありません。",
                  "A rough guide from the AI based on the image. It does not determine the value of the work.",
                )}
              </p>
            </div>
          )}
        </>
      )}
    </section>
  )
}

const aiEvaluationStatusQuery = graphql(
  `query AiEvaluationStatus($id: ID!) {
    work(id: $id) {
      id
      botEvaluationStatus
      botEvaluation {
        cutenessScore
        coolnessScore
        beautyScore
        originalityScore
        compositionScore
        colorScore
        detailScore
        consistencyScore
        overallScore
        comment
        personality
      }
    }
  }`,
)

const retryWorkBotGradingMutation = graphql(
  `mutation RetryWorkBotGrading($workId: ID!) {
    retryWorkBotGrading(workId: $workId)
  }`,
)
