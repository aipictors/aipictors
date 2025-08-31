import { useId } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Checkbox } from "~/components/ui/checkbox"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import { Sparkles, Loader2Icon, CheckCircle } from "lucide-react"
import { AuthContext } from "~/contexts/auth-context"
import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { resizeImage } from "~/utils/resize-image"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { getBase64FromImageUrl } from "~/utils/get-base64-from-image-url"
import { toast } from "sonner"
import { useState, useContext } from "react"
import { useTranslation } from "~/hooks/use-translation"

type BotPersonalityType = "female" | "male" | "robot" | "sage" | "pictor_chan"
type BotGradingType = "COMMENT_ONLY" | "SCORE_ONLY" | "COMMENT_AND_SCORE"

type Props = {
  workId: string
  isAlreadyRequested?: boolean
  isAlreadyEvaluated?: boolean
  isBotGradingEnabled?: boolean
  currentBotGradingPublic?: boolean
  currentBotGradingRankingEnabled?: boolean
  smallThumbnailImageURL?: string
  userToken?: string | null
  onChangeBotGradingPublic: (isPublic: boolean) => void
  onChangeBotGradingRankingEnabled: (enabled: boolean) => void
}

// RequestWorkBotGradingMutation の定義
const RequestWorkBotGradingMutation = graphql(
  `mutation RequestWorkBotGrading($input: RequestWorkBotGradingInput!) {
    requestWorkBotGrading(input: $input) {
      id
      title
      isBotGradingEnabled
      botEvaluation {
        overallScore
        comment
      }
    }
  }`,
)

export function AiEvaluationSection(props: Props) {
  console.log("=== AiEvaluationSection rendered ===")
  console.log("Props:", {
    currentBotGradingPublic: props.currentBotGradingPublic,
    currentBotGradingRankingEnabled: props.currentBotGradingRankingEnabled,
    isBotGradingEnabled: props.isBotGradingEnabled,
  })

  const authContext = useContext(AuthContext)
  const t = useTranslation()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)
  const [selectedPersonality, setSelectedPersonality] =
    useState<BotPersonalityType>("pictor_chan")
  const [selectedGradingType, setSelectedGradingType] =
    useState<BotGradingType>("COMMENT_AND_SCORE")
  const [requestBotGradingPublic, setRequestBotGradingPublic] = useState(true)
  const [requestBotGradingRankingEnabled, setRequestBotGradingRankingEnabled] =
    useState(true)

  // 性格オプション
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

  const requestPublicId = useId()
  const requestRankingId = useId()
  const requestDialogPublicId = useId()
  const requestDialogRankingId = useId()

  const isLoggedIn = authContext.isLoggedIn
  const [requestBotGrading] = useMutation(RequestWorkBotGradingMutation)

  // デバッグ用ログ
  console.log("AiEvaluationSection props:", {
    currentBotGradingPublic: props.currentBotGradingPublic,
    currentBotGradingRankingEnabled: props.currentBotGradingRankingEnabled,
  })

  // AI評価リクエストの実行
  const handleRequest = async () => {
    if (!props.userToken || !props.smallThumbnailImageURL) {
      toast.error("リクエストに必要な情報が不足しています")
      return
    }

    setIsRequesting(true)

    try {
      // 画像の準備とアップロード
      const thumbnailBase64 = await getBase64FromImageUrl(
        props.smallThumbnailImageURL,
      )
      const resizedImage = await resizeImage(thumbnailBase64, 1024, 1024)
      const uploadedImageUrl = await uploadPublicImage(
        resizedImage.base64,
        props.userToken,
      )

      // AI評価をリクエスト
      const result = await requestBotGrading({
        variables: {
          // @ts-ignore - GraphQL型生成の問題のため一時的に無効化
          input: {
            workId: props.workId,
            imageUrl: uploadedImageUrl,
            isBotGradingPublic: requestBotGradingPublic,
            isBotGradingRankingEnabled: requestBotGradingRankingEnabled,
            botPersonality: selectedPersonality,
            botGradingType: selectedGradingType,
          },
        },
      })

      if (result.data?.requestWorkBotGrading) {
        toast.success("AI評価をリクエストしました。結果をお待ちください。")
        setIsDialogOpen(false)
      } else {
        throw new Error("リクエストの処理に失敗しました")
      }
    } catch (error) {
      console.error("AI評価リクエストエラー:", error)
      toast.error("AI評価のリクエストに失敗しました")
    } finally {
      setIsRequesting(false)
    }
  }

  // ボタンの状態とテキストを決定
  const getButtonConfig = () => {
    if (props.isAlreadyEvaluated) {
      return {
        text: "AI評価完了",
        disabled: true,
        variant: "secondary" as const,
        icon: CheckCircle,
      }
    }
    if (props.isAlreadyRequested) {
      return {
        text: "AI評価リクエスト済み",
        disabled: true,
        variant: "secondary" as const,
        icon: Loader2Icon,
      }
    }
    return {
      text: "AI評価をリクエスト",
      disabled: false,
      variant: "default" as const,
      icon: Sparkles,
    }
  }

  const buttonConfig = getButtonConfig()
  const ButtonIcon = buttonConfig.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">AI評価設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI評価設定 - AI評価が有効な場合のみ表示 */}
        {props.isBotGradingEnabled && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={requestPublicId}
                checked={props.currentBotGradingPublic ?? false}
                onCheckedChange={(checked) => {
                  console.log("=== PUBLIC checkbox clicked ===")
                  console.log("Checkbox ID:", requestPublicId)
                  console.log("Checked value:", checked)
                  console.log(
                    "Current prop value:",
                    props.currentBotGradingPublic,
                  )
                  const isChecked = checked === true
                  props.onChangeBotGradingPublic(isChecked)
                }}
              />
              <Label
                htmlFor={requestPublicId}
                className="cursor-pointer text-sm"
              >
                AI評価を公開する
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={requestRankingId}
                checked={props.currentBotGradingRankingEnabled ?? false}
                onCheckedChange={(checked) => {
                  console.log("=== RANKING checkbox clicked ===")
                  console.log("Checkbox ID:", requestRankingId)
                  console.log("Checked value:", checked)
                  console.log(
                    "Current prop value:",
                    props.currentBotGradingRankingEnabled,
                  )
                  const isChecked = checked === true
                  props.onChangeBotGradingRankingEnabled(isChecked)
                }}
              />
              <Label
                htmlFor={requestRankingId}
                className="cursor-pointer text-sm"
              >
                AI評価をランキングに使用する
              </Label>
            </div>

            <Separator />
          </div>
        )}

        {/* AI評価リクエスト */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">AI評価リクエスト</h4>
              <p className="text-muted-foreground text-sm">
                AIによる作品の評価とコメントを受け取れます
              </p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                disabled={buttonConfig.disabled || !isLoggedIn}
                className="w-full"
              >
                <ButtonIcon className="mr-2 h-4 w-4" />
                {buttonConfig.text}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>AI評価をリクエスト</DialogTitle>
                <DialogDescription>
                  AIによる作品の評価とコメントを受け取ります。評価の設定を選択してください。
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="personality">AIの性格</Label>
                  <Select
                    value={selectedPersonality}
                    onValueChange={(value: BotPersonalityType) =>
                      setSelectedPersonality(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grading-type">評価タイプ</Label>
                  <Select
                    value={selectedGradingType}
                    onValueChange={(value: BotGradingType) =>
                      setSelectedGradingType(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gradingTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="font-medium text-sm">
                    リクエスト時の公開設定
                  </Label>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={requestDialogPublicId}
                      checked={requestBotGradingPublic}
                      onCheckedChange={(checked) =>
                        setRequestBotGradingPublic(checked === true)
                      }
                    />
                    <Label
                      htmlFor={requestDialogPublicId}
                      className="cursor-pointer text-sm"
                    >
                      AI評価を公開する
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={requestDialogRankingId}
                      checked={requestBotGradingRankingEnabled}
                      onCheckedChange={(checked) =>
                        setRequestBotGradingRankingEnabled(checked === true)
                      }
                    />
                    <Label
                      htmlFor={requestDialogRankingId}
                      className="cursor-pointer text-sm"
                    >
                      AI評価をランキングに使用する
                    </Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  キャンセル
                </Button>
                <Button onClick={handleRequest} disabled={isRequesting}>
                  {isRequesting ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      リクエスト中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      リクエスト
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
