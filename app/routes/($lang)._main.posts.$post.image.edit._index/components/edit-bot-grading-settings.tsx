import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { Label } from "~/components/ui/label"
import { useTranslation } from "~/hooks/use-translation"
import { useId } from "react"

type Props = {
  isBotGradingEnabled: boolean
  isBotGradingPublic: boolean
  isBotGradingRankingEnabled: boolean
  onChangeBotGradingPublic: (isPublic: boolean) => void
  onChangeBotGradingRankingEnabled: (enabled: boolean) => void
}

/**
 * 編集画面用AI評価設定フォーム
 * AI評価が有効な場合のみ、公開設定とランキング参加設定を表示
 */
export function EditBotGradingSettings (props: Props) {
  const t = useTranslation()
  const botGradingPublicId = useId()
  const botGradingRankingId = useId()

  // AI評価が無効な場合は何も表示しない
  if (!props.isBotGradingEnabled) {
    return null
  }

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
        <div className="text-muted-foreground text-sm">
          {t(
            "この作品はAI評価が有効になっています。公開設定とランキング参加設定のみ変更できます。",
            "AI grading is enabled for this work. You can only change the public setting and ranking participation setting.",
          )}
        </div>

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
            <span>{t("AI評価を公開する", "Make AI evaluation public")}</span>
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
      </CardContent>
    </Card>
  )
}
