import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { useTranslation } from "~/hooks/use-translation"
import { Badge } from "~/components/ui/badge"
import { useId } from "react"

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
  console.log("=== PostFormItemBotGrading rendered ===")
  console.log("Props:", {
    isBotGradingPublic: props.isBotGradingPublic,
    isBotGradingRankingEnabled: props.isBotGradingRankingEnabled,
    isBotGradingEnabled: props.isBotGradingEnabled,
    isEditMode: props.isEditMode,
  })

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
      icon: "https://assets.aipictors.com/pictorchan-icon_11zon.webp",
    },
  ] as const

  const gradingTypeOptions = [
    { value: "COMMENT_ONLY", label: t("コメントのみ", "Comment Only") },
    { value: "SCORE_ONLY", label: t("採点のみ", "Score Only") },
    {
      value: "COMMENT_AND_SCORE",
      label: t("コメントと採点両方", "Comment and Score"),
    },
  ] as const

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <p className="font-bold text-sm">
            {t("AI評価設定", "AI Grading Settings")}
          </p>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI評価についての説明 */}
        {!props.isEditMode && (
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
            <p className="text-blue-800 text-sm dark:text-blue-200">
              {t(
                "AIが作品を自動で評価し、コメントや採点を行います。投稿後しばらくしてから評価が表示されます。",
                "AI will automatically evaluate your work and provide comments or scores. The evaluation will be displayed some time after posting.",
              )}
            </p>
          </div>
        )}

        {/* 編集画面では「AI評価を利用する」チェックボックスを非表示 */}
        {!props.isEditMode && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={botGradingEnabledId}
              checked={props.isBotGradingEnabled}
              onCheckedChange={(checked) =>
                props.onChangeBotGradingEnabled(checked === true)
              }
            />
            <Label
              htmlFor={botGradingEnabledId}
              className="flex items-center space-x-2"
            >
              <span>{t("AI評価を利用する", "Enable AI grading")}</span>
            </Label>
          </div>
        )}

        {/* AI評価が有効な場合のみ表示される設定 */}
        {props.isBotGradingEnabled && (
          <div
            className={`space-y-4 ${!props.isEditMode ? "border-muted border-l-2 pl-6" : ""}`}
          >
            {/* 編集画面では性格選択と採点タイプ選択を非表示 */}
            {!props.isEditMode && (
              <>
                {/* AIの性格選択 */}
                <div className="space-y-2">
                  <Label htmlFor={botPersonalityId}>
                    {t("AIの性格", "AI Personality")}
                  </Label>
                  <Select
                    value={props.botPersonality}
                    onValueChange={(value) =>
                      props.onChangeBotPersonality(value as BotPersonalityType)
                    }
                  >
                    <SelectTrigger id={botPersonalityId}>
                      <SelectValue
                        placeholder={t("性格を選択", "Select personality")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {personalityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center space-x-2">
                            <img
                              src={option.icon}
                              alt={option.label}
                              className="h-4 w-4 rounded-full object-cover"
                            />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground text-sm">
                    {t(
                      "AIの評価スタイルを選択できます。",
                      "You can choose the AI's evaluation style.",
                    )}
                  </p>
                </div>

                {/* AI評価タイプ選択 */}
                <div className="space-y-2">
                  <Label htmlFor={botGradingTypeId}>
                    {t("採点タイプ", "Grading Type")}
                  </Label>
                  <Select
                    value={props.botGradingType}
                    onValueChange={(value) =>
                      props.onChangeBotGradingType(value as BotGradingType)
                    }
                  >
                    <SelectTrigger id={botGradingTypeId}>
                      <SelectValue
                        placeholder={t(
                          "採点タイプを選択",
                          "Select grading type",
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {gradingTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground text-sm">
                    {t(
                      "AIが提供する評価の形式を選択できます。",
                      "You can choose the format of AI evaluation.",
                    )}
                  </p>
                </div>
              </>
            )}

            {/* 評価を公開するかどうか */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id={botGradingPublicId}
                checked={props.isBotGradingPublic}
                onCheckedChange={(checked) =>
                  props.onChangeBotGradingPublic(checked === true)
                }
              />
              <Label
                htmlFor={botGradingPublicId}
                className="flex items-center space-x-2"
              >
                <span>
                  {t("AI評価を公開する", "Make AI evaluation public")}
                </span>
              </Label>
            </div>

            {/* ランキングに参加するかどうか */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id={botGradingRankingId}
                checked={props.isBotGradingRankingEnabled}
                onCheckedChange={(checked) =>
                  props.onChangeBotGradingRankingEnabled(checked === true)
                }
              />
              <Label
                htmlFor={botGradingRankingId}
                className="flex items-center space-x-2"
              >
                <span>
                  {t(
                    "AI評価ランキングに参加する（未リリース、後日リリース予定です）",
                    "Participate in AI grading ranking",
                  )}
                </span>
              </Label>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
