import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { cn } from "~/lib/utils"
import { toDateText } from "~/utils/to-date-text"
import { PassBenefitList } from "~/routes/($lang)._main.plus._index/components/pass-benefit-list"
import { PassImageGenerationBenefitList } from "~/routes/($lang)._main.plus._index/components/pass-image-generation-benefit-list"
import { PlusAbout } from "~/routes/($lang)._main.plus._index/components/plus-about"
import { toPassName } from "~/routes/($lang)._main.plus._index/utils/to-pass-name"
import { useMutation, useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { toast } from "sonner"

export function PlusForm() {
  const [mutation, { loading: isLoading }] = useMutation(
    createCustomerPortalSessionMutation,
  )

  const { data } = useSuspenseQuery(viewerCurrentPassQuery, {})

  const onOpenCustomerPortal = async () => {
    try {
      const result = await mutation({})
      const pageURL = result.data?.createCustomerPortalSession ?? null
      if (pageURL === null) {
        toast("セッションの作成に失敗しました。")
        return
      }
      window.location.assign(pageURL)
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
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
                  "決済方法の変更やプランのキャンセル及び変更はこちらのリンクから行えます。"
                }
              </p>
              <Button
                className="w-full"
                onClick={onOpenCustomerPortal}
                disabled={isLoading}
              >
                {"プランをキャンセルまたは変更する"}
              </Button>
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
            <PlusAbout hideSubmitButton={true} showUpgradePlansOnly={true} />
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

const createCustomerPortalSessionMutation = graphql(
  `mutation CreateCustomerPortalSession {
    createCustomerPortalSession
  }`,
)
