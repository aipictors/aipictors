import { useMutation } from "@apollo/client/index"
import { AlertCircle, RefreshCw } from "lucide-react"
import { graphql } from "gql.tada"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { useTranslation } from "~/hooks/use-translation"
import { toDateTimeText } from "~/utils/to-date-time-text"

type Props = {
  workId: string
  isOwner: boolean
  canRequestImageAnalysis: boolean
  imageAnalysisRequestReason: string | null
  imageAnalysisRequestAvailableAt: number | null
  imageAnalysisRemainingRequestsToday: number
}

export function WorkImageAnalysisRequestCard(props: Props) {
  const t = useTranslation()
  const [requestWorkImageAnalysis, { loading }] = useMutation(
    requestWorkImageAnalysisMutation,
  )

  if (!props.isOwner) {
    return null
  }

  const getReasonText = () => {
    if (props.imageAnalysisRequestReason === "ALREADY_ANALYZED") {
      return t(
        "この作品はすでにAI判定済みです。",
        "This work has already been AI analyzed.",
      )
    }

    if (props.imageAnalysisRequestReason === "COOLDOWN") {
      if (props.imageAnalysisRequestAvailableAt === null) {
        return t(
          "AI判定の再依頼は前回依頼から24時間後に可能です。",
          "You can request AI analysis again 24 hours after the previous request.",
        )
      }

      return t(
        `AI判定の再依頼は ${toDateTimeText(props.imageAnalysisRequestAvailableAt)} 以降に可能です。`,
        `You can request AI analysis again after ${toDateTimeText(props.imageAnalysisRequestAvailableAt)}.`,
      )
    }

    if (props.imageAnalysisRequestReason === "DAILY_LIMIT") {
      return t(
        "本日の再依頼回数の上限に達しています。",
        "You have reached today's request limit.",
      )
    }

    if (props.imageAnalysisRequestReason === "NO_IMAGE") {
      return t(
        "AI判定対象の画像が見つかりません。",
        "No image is available for AI analysis.",
      )
    }

    return t(
      "現在はAI判定を再依頼できません。",
      "AI analysis cannot be requested right now.",
    )
  }

  const onRequest = async () => {
    try {
      await requestWorkImageAnalysis({
        variables: {
          input: {
            workId: props.workId,
          },
        },
      })

      toast.success(
        t(
          "AI判定の再依頼を送信しました。",
          "AI analysis request has been sent.",
        ),
      )
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
        return
      }

      toast.error(
        t(
          "AI判定の再依頼に失敗しました。",
          "Failed to request AI analysis.",
        ),
      )
    }
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div className="space-y-1">
            <div className="font-medium text-sm">
              {t("AI判定を再依頼", "Request AI analysis")}
            </div>
            <p className="text-muted-foreground text-xs leading-5">
              {props.canRequestImageAnalysis
                ? t(
                    `本日の残り回数: ${props.imageAnalysisRemainingRequestsToday}`,
                    `Remaining requests today: ${props.imageAnalysisRemainingRequestsToday}`,
                  )
                : getReasonText()}
            </p>
          </div>
        </div>
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRequest}
            disabled={!props.canRequestImageAnalysis || loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {t("AI判定を再依頼", "Request AI analysis")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const requestWorkImageAnalysisMutation = graphql(`mutation RequestWorkImageAnalysis($input: RequestWorkImageAnalysisInput!) {
  requestWorkImageAnalysis(input: $input) {
    id
  }
}`)