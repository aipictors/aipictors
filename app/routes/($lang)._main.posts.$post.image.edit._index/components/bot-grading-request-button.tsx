import { useState, useContext, useId } from "react"
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
import { toast } from "sonner"
import { Sparkles, Loader2Icon, CheckCircle } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { AuthContext } from "~/contexts/auth-context"
import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { resizeImage } from "~/utils/resize-image"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { getBase64FromImageUrl } from "~/utils/get-base64-from-image-url"

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

/**
 * Bot評価リクエストボタンコンポーネント
 * 作品の編集画面でBot評価をリクエストできる
 */
export function BotGradingRequestButton(props: Props) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)

  const [requestBotGrading, { loading: isLoading }] = useMutation(
    RequestWorkBotGradingMutation,
  )

  const botGradingPublicId = useId()
  const botGradingRankingId = useId()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBotGradingPublic, setIsBotGradingPublic] = useState(
    props.currentBotGradingPublic ?? true,
  )
  const [isBotGradingRankingEnabled, setIsBotGradingRankingEnabled] = useState(
    props.currentBotGradingRankingEnabled ?? false,
  )
  const [botPersonality, setBotPersonality] =
    useState<BotPersonalityType>("female")
  const [botGradingType, setBotGradingType] =
    useState<BotGradingType>("COMMENT_AND_SCORE")

  // ログインしていない場合は表示しない
  if (!authContext.isLoggedIn) {
    return null
  }

  // ユーザートークンがない場合は表示しない
  if (!props.userToken) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950/20">
        <Sparkles className="h-5 w-5 text-yellow-600" />
        <span className="text-sm text-yellow-800 dark:text-yellow-200">
          {t(
            "認証情報が不足しています。ページを再読み込みしてください。",
            "Authentication information is missing. Please reload the page.",
          )}
        </span>
      </div>
    )
  }

  // すでに評価済みの場合
  if (props.isAlreadyEvaluated) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-950/20">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <span className="text-green-800 text-sm dark:text-green-200">
          {t(
            "この作品はすでにAI評価が完了しています",
            "This work has already been evaluated by AI",
          )}
        </span>
      </div>
    )
  }

  // すでにリクエスト済みの場合
  if (props.isAlreadyRequested || props.isBotGradingEnabled) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
        <Loader2Icon className="h-5 w-5 animate-spin text-blue-600" />
        <span className="text-blue-800 text-sm dark:text-blue-200">
          {t(
            "AI評価をリクエスト中です",
            "AI evaluation request is in progress",
          )}
        </span>
      </div>
    )
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

  const handleRequest = async () => {
    try {
      if (!props.smallThumbnailImageURL) {
        throw new Error("Thumbnail image URL is required")
      }

      // 画像をBase64に変換
      const base64Image = await getBase64FromImageUrl(
        props.smallThumbnailImageURL,
      )

      // 画像をJPEGにリサイズ（400x）
      const resizedBase64 = await resizeImage(base64Image, 400)

      console.log(" props.userToken", props.userToken)

      // リサイズされた画像をアップロード
      const uploadedImageUrl = await uploadPublicImage(
        resizedBase64.base64,
        props.userToken!,
      )

      // 実際のGraphQL mutationを実行
      const result = await requestBotGrading({
        variables: {
          // @ts-ignore
          input: {
            workId: props.workId,
            imageUrl: uploadedImageUrl,
            isBotGradingPublic,
            isBotGradingRankingEnabled,
            botPersonality,
            botGradingType,
          },
        },
      })

      if (result.data?.requestWorkBotGrading) {
        toast(
          t("AI評価をリクエストしました", "AI evaluation has been requested"),
        )
        setIsDialogOpen(false)

        // キャッシュの更新により、画面の再読み込みなしで状態を反映
        // Apollo Clientのキャッシュが自動的に更新される
      } else {
        throw new Error("No data returned from mutation")
      }
    } catch (error) {
      console.error("Failed to request bot grading:", error)

      let errorMessage = t(
        "AI評価のリクエストに失敗しました",
        "Failed to request AI evaluation",
      )

      if (error instanceof Error) {
        // GraphQLエラーやネットワークエラーなど具体的なエラーメッセージを表示
        errorMessage = error.message
      }

      toast(errorMessage)
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <span>{t("AI評価をリクエスト", "Request AI Evaluation")}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {t("AI評価のリクエスト", "Request AI Evaluation")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "AIが作品を自動で評価し、コメントや採点を行います。",
              "AI will automatically evaluate your work and provide comments or scores.",
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* AI性格選択 */}
          <div className="space-y-2">
            <Label>{t("AIの性格", "AI Personality")}</Label>
            <Select
              value={botPersonality}
              onValueChange={(value) =>
                setBotPersonality(value as BotPersonalityType)
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

          {/* 採点タイプ選択 */}
          <div className="space-y-2">
            <Label>{t("採点タイプ", "Grading Type")}</Label>
            <Select
              value={botGradingType}
              onValueChange={(value) =>
                setBotGradingType(value as BotGradingType)
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

          {/* 公開設定 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id={botGradingPublicId}
              checked={isBotGradingPublic}
              onCheckedChange={(checked) =>
                setIsBotGradingPublic(checked === true)
              }
            />
            <Label htmlFor={botGradingPublicId}>
              {t("AI評価を公開する", "Make AI evaluation public")}
            </Label>
          </div>

          {/* ランキング参加設定 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id={botGradingRankingId}
              checked={isBotGradingRankingEnabled}
              onCheckedChange={(checked) =>
                setIsBotGradingRankingEnabled(checked === true)
              }
            />
            <Label htmlFor={botGradingRankingId}>
              {t(
                "AI評価ランキングに参加する",
                "Participate in AI grading ranking",
              )}
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isLoading}
          >
            {t("キャンセル", "Cancel")}
          </Button>
          <Button onClick={handleRequest} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                {t("リクエスト中...", "Requesting...")}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {t("リクエスト", "Request")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
