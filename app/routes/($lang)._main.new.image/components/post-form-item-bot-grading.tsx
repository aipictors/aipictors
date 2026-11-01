import { useId } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type BotPersonalityType = "female" | "male" | "robot" | "sage" | "pictor_chan"
type BotGradingType = "COMMENT_ONLY" | "SCORE_ONLY" | "COMMENT_AND_SCORE"

type Props = {
  isBotGradingEnabled: boolean
  isBotGradingPublic: boolean
  isBotGradingRankingEnabled: boolean
  botPersonality: BotPersonalityType
  botGradingType: BotGradingType
  onChangeBotGradingEnabled: (enabled: boolean) => void
  onChangeBotGradingPublic: (isPublic: boolean) => void
  onChangeBotGradingRankingEnabled: (enabled: boolean) => void
  onChangeBotPersonality: (personality: BotPersonalityType) => void
  onChangeBotGradingType: (type: BotGradingType) => void
  isEditMode?: boolean
}

/**
 * AI評価設定フォーム
 */
export function PostFormItemBotGrading(props: Props) {
  const t = useTranslation()
  const botPersonalityId = useId()
  const botGradingTypeId = useId()
  const botGradingEnabledId = useId()
  const botGradingPublicId = useId()
  const botGradingRankingId = useId()

  // 編集画面では何も表示しない（AiEvaluationSectionが使用される）
  if (props.isEditMode) {
    return null
  }

  const personalityOptions = [
    {
      value: "female",
      label: t("女性", "Female"),
      icon: "https://assets.aipictors.com/girl-icon_11zon.webp",
    },
    {
      value: "male",
      label: t("男性", "Male"),
      icon: "https://assets.aipictors.com/man-icon_11zon.webp",
    },
    {
      value: "robot",
      label: t("ロボット", "Robot"),
      icon: "https://assets.aipictors.com/robot-icon_11zon.webp",
    },
    {
      value: "sage",
      label: t("賢人", "Sage"),
      icon: "https://assets.aipictors.com/kenjin-icon_11zon.webp",
    },
    {
      value: "pictor_chan",
      label: t("ぴくたーちゃん", "Pictor-chan"),
      icon: "https://assets.aipictors.com/pictorchanicon.webp",
    },
  ] as const

  const gradingTypeOptions = [
    {
      value: "COMMENT_AND_SCORE",
      label: t("コメントと点数", "Comment + score"),
    },
    { value: "COMMENT_ONLY", label: t("コメントだけ", "Comment only") },
    { value: "SCORE_ONLY", label: t("点数だけ", "Score only") },
  ] as const

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-3">
          <Label
            htmlFor={botGradingEnabledId}
            className="flex min-w-0 flex-col gap-0.5"
          >
            <span className="font-bold text-sm">
              {t("AI評価", "AI grading")}
            </span>
            <span className="font-normal text-muted-foreground text-xs leading-snug">
              {t(
                "AIが作品を見て、コメントと点数を付けます。投稿の数分後に作品ページに出ます",
                "The AI reviews your work with a comment and scores. They appear on the work page a few minutes after posting.",
              )}
            </span>
          </Label>
          <Switch
            id={botGradingEnabledId}
            checked={props.isBotGradingEnabled}
            onCheckedChange={props.onChangeBotGradingEnabled}
          />
        </CardTitle>
      </CardHeader>
      {props.isBotGradingEnabled && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p id={botPersonalityId} className="font-medium text-sm">
              {t("だれに評価してもらう？", "Who should review it?")}
            </p>
            <div
              role="group"
              aria-labelledby={botPersonalityId}
              className="grid grid-cols-5 gap-1.5"
            >
              {personalityOptions.map((option) => {
                const isActive = props.botPersonality === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => props.onChangeBotPersonality(option.value)}
                    className={cn(
                      "flex min-w-0 flex-col items-center gap-1 rounded-lg border p-1.5 transition-colors",
                      isActive
                        ? "border-primary bg-primary/10"
                        : "hover:bg-muted",
                    )}
                  >
                    <img
                      src={option.icon}
                      alt=""
                      width={40}
                      height={40}
                      loading="lazy"
                      className="size-10 rounded-full object-cover"
                    />
                    <span className="w-full break-all text-center text-[10px] leading-tight sm:text-[11px]">
                      {option.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p id={botGradingTypeId} className="font-medium text-sm">
              {t("評価の内容", "What to include")}
            </p>
            <div
              role="group"
              aria-labelledby={botGradingTypeId}
              className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1"
            >
              {gradingTypeOptions.map((option) => {
                const isActive = props.botGradingType === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => props.onChangeBotGradingType(option.value)}
                    className={cn(
                      "rounded-md px-1 py-1.5 text-xs transition-colors",
                      isActive
                        ? "bg-background font-medium shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3 border-t pt-3">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor={botGradingPublicId} className="font-normal">
                {t("他の人にも見せる", "Show to others")}
              </Label>
              <Switch
                id={botGradingPublicId}
                checked={props.isBotGradingPublic}
                onCheckedChange={props.onChangeBotGradingPublic}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label
                htmlFor={botGradingRankingId}
                className="flex min-w-0 flex-col gap-0.5 font-normal"
              >
                <span>
                  {t(
                    "AI評価ランキングに参加する",
                    "Join the AI grading ranking",
                  )}
                </span>
                <span className="text-muted-foreground text-xs leading-snug">
                  {t(
                    "入賞しても通常の入賞数には含まれません",
                    "Placements here don't count toward regular awards",
                  )}
                </span>
              </Label>
              <Switch
                id={botGradingRankingId}
                checked={props.isBotGradingRankingEnabled}
                onCheckedChange={props.onChangeBotGradingRankingEnabled}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
