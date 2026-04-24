import { getAuth, getIdToken } from "firebase/auth"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { cn } from "~/lib/utils"
import { toDateText } from "~/utils/to-date-text"
import { PassBenefitList } from "~/routes/($lang)._main.plus._index/components/pass-benefit-list"
import { PassImageGenerationBenefitList } from "~/routes/($lang)._main.plus._index/components/pass-image-generation-benefit-list"
import { PlusAbout } from "~/routes/($lang)._main.plus._index/components/plus-about"
import { toPassName } from "~/routes/($lang)._main.plus._index/utils/to-pass-name"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useState } from "react"
import { toast } from "sonner"

export function PlusForm () {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data } = useSuspenseQuery<{
    viewer: {
      id: string
      currentPass: {
        id: string
        type: "LITE" | "STANDARD" | "PREMIUM" | "TWO_DAYS"
        price: number
        periodEnd: number
      } | null
    } | null
  }>(viewerCurrentPassQuery, {})

  const withAuthHeader = async () => {
    const currentUser = getAuth().currentUser
    if (!currentUser) {
      throw new Error("ログインが必要です")
    }

    const idToken = await getIdToken(currentUser)

    return {
      authorization: `Bearer ${idToken}`,
      "content-type": "application/json",
    }
  }

  const onCancelCurrentSubscription = async () => {
    if (!window.confirm("現在のサブスクを解約します。よろしいですか？")) {
      return
    }

    try {
      setIsSubmitting(true)
      const headers = await withAuthHeader()
      const response = await fetch("/api/stripe/subscription-cancel", {
        method: "POST",
        headers,
      })

      const json = (await response.json()) as {
        error: string | null
        data: { status: string } | null
      }

      if (!response.ok || json.error || !json.data) {
        toast(json.error ?? "解約に失敗しました。")
        return
      }

      toast("解約手続きを受け付けました。次回更新日まで利用できます。")
      window.location.reload()
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const onChangeCurrentPlan = async (
    passType: "LITE" | "STANDARD" | "PREMIUM",
    currentPassType: "LITE" | "STANDARD" | "PREMIUM" | "TWO_DAYS",
  ) => {
    try {
      setIsSubmitting(true)
      const headers = await withAuthHeader()
      const response = await fetch("/api/stripe/subscription-change-plan", {
        method: "POST",
        headers,
        body: JSON.stringify({
          passType,
          currentPassType,
        }),
      })

      const json = (await response.json()) as {
        error: string | null
        data: {
          passType: string
          amountJpy: number
        } | null
      }

      if (!response.ok || json.error || !json.data) {
        toast(json.error ?? "プラン変更に失敗しました。")
        return
      }

      toast("プランを変更しました。")
      window.location.reload()
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (data.viewer === null) {
    return null
  }

  const currentPass = data.viewer.currentPass

  const nextDateText = currentPass ? toDateText(currentPass.periodEnd) : ""

  const currentPassName = currentPass ? toPassName(currentPass.type) : ""

  return (
    <>
      {currentPass ? (
        <>
          <div
            className={cn(
              "justify-between gap-x-4 space-y-4 md:space-y-0",
              currentPass && "flex flex-col md:flex-row",
            )}
          >
            <div className="flex-1 space-y-4">
              <p>{`現在、あなたは「${currentPassName}」をご利用中です。`}</p>
              <div>
                <div className="flex">
                  <span className="mr-2 mb-2 rounded-full bg-gray-200 px-3 py-1 font-semibold text-gray-700 text-sm">
                    {"次回の請求日"}
                  </span>
                  <p>{nextDateText}</p>
                </div>
                <div className="flex">
                  <span className="mr-2 mb-2 rounded-full bg-gray-200 px-3 py-1 font-semibold text-gray-700 text-sm">
                    {"次回の請求額"}
                  </span>
                  <p>{`${currentPass.price}円（税込）`}</p>
                </div>
              </div>
              <p>
                {
                  "この画面からサブスクのキャンセルとプラン変更を行えます。"
                }
              </p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <Button
                  className="w-full"
                  onClick={onCancelCurrentSubscription}
                  disabled={isSubmitting}
                  variant="destructive"
                >
                  {"サブスクをキャンセルする"}
                </Button>
                {currentPass.type === "LITE" && (
                  <Button
                    className="w-full"
                    onClick={() => onChangeCurrentPlan("STANDARD", currentPass.type)}
                    disabled={isSubmitting}
                  >
                    {"スタンダードに変更する"}
                  </Button>
                )}
                {currentPass.type === "LITE" && (
                  <Button
                    className="w-full"
                    onClick={() => onChangeCurrentPlan("PREMIUM", currentPass.type)}
                    disabled={isSubmitting}
                  >
                    {"プレミアムに変更する"}
                  </Button>
                )}
                {currentPass.type === "STANDARD" && (
                  <Button
                    className="w-full"
                    onClick={() => onChangeCurrentPlan("PREMIUM", currentPass.type)}
                    disabled={isSubmitting}
                  >
                    {"プレミアムに変更する"}
                  </Button>
                )}
              </div>
            </div>
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>{`${currentPassName}の特典`}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Separator />
                <PassBenefitList passType={currentPass.type} />
                <Separator />
                <p className="font-bold text-sm opacity-60">
                  {"画像生成の特典"}
                </p>
                <PassImageGenerationBenefitList passType={currentPass.type} />
                <Separator />
                <p className="text-xs">
                  {
                    "本プランは何らかの理由により内容を追加、又は廃止する場合があります。"
                  }
                </p>
              </CardContent>
            </Card>
          </div>
          {currentPass.type !== "PREMIUM" && (
            <PlusAbout showUpgradePlansOnly={true} />
          )}
        </>
      ) : (
        <PlusAbout showUpgradePlansOnly={true} />
      )}
    </>
  )
}

const viewerCurrentPassQuery = graphql(
  `query ViewerCurrentPass {
    viewer {
      id
      currentPass {
        id
        type
        price
        periodEnd
      }
    }
  }`,
)
