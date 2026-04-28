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
import { useEffect, useState } from "react"
import { toast } from "sonner"

/**
 * Remix v3_singleFetch モードでは、action が Response を返しても
 * 通常の fetch() には HTML ページが返ることがある。
 * この関数はその両方を透過的にハンドリングし、JSON を取り出す。
 */
async function parseActionResponse<T>(response: Response): Promise<{
  ok: boolean
  json: T | null
  isHtmlWrapped: boolean
  statusHint: string | null
}> {
  const responseText = await response.text()
  const isHtmlWrapped =
    responseText.trim().startsWith("<!DOCTYPE") ||
    responseText.trim().startsWith("<html")

  if (isHtmlWrapped) {
    const statusMatch = responseText.match(/"status","([^"]+)"/)
    // Remix SSR ラップされた場合: streamController の enqueue 内に JSON が埋め込まれている
    // 例: "\"error\",\"data\",{...},\"status\",\"cancellation_requested\""
    // action が成功していれば "\"error\"" の次に null が来る
    // ここでは response.ok + HTML = action 成功とみなす
    return {
      ok: response.ok,
      json: null,
      isHtmlWrapped: true,
      statusHint: statusMatch?.[1] ?? null,
    }
  }

  const json = (() => {
    if (!responseText) return null
    try {
      return JSON.parse(responseText) as T
    } catch {
      return null
    }
  })()

  return { ok: response.ok, json, isHtmlWrapped: false, statusHint: null }
}

export function PlusForm () {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCancelScheduled, setIsCancelScheduled] = useState(false)
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
    if (isCancelScheduled) {
      toast("すでに解約手続き済みです。次回更新日までは利用できます。")
      return
    }

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

      const { ok, json, isHtmlWrapped } = await parseActionResponse<{
        error: string | null
        data: { status: string } | null
      }>(response)

      if (isHtmlWrapped) {
        if (!ok) {
          toast("解約に失敗しました。")
          return
        }
        // Remix が HTML を返したが action は成功済み
        setIsCancelScheduled(true)
        toast("解約手続きを受け付けました。次回更新日まで利用できます。")
        return
      }

      if (!ok || json?.error || !json?.data) {
        toast(json?.error ?? "解約に失敗しました。")
        return
      }

      setIsCancelScheduled(true)
      toast("解約手続きを受け付けました。次回更新日まで利用できます。")
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const onResumeSubscription = async () => {
    if (!window.confirm("解約を取り消して、サブスクを継続しますか？")) {
      return
    }

    try {
      setIsSubmitting(true)
      const headers = await withAuthHeader()
      const response = await fetch("/api/stripe/subscription-resume", {
        method: "POST",
        headers,
      })

      const { ok, json, isHtmlWrapped } = await parseActionResponse<{
        error: string | null
        data: { status: string } | null
      }>(response)

      if (isHtmlWrapped) {
        if (!ok) {
          toast("解約取り消しに失敗しました。")
          return
        }
        setIsCancelScheduled(false)
        toast("解約を取り消しました。引き続きご利用いただけます。")
        return
      }

      if (!ok || json?.error || !json?.data) {
        toast(json?.error ?? "解約取り消しに失敗しました。")
        return
      }

      setIsCancelScheduled(false)
      toast("解約を取り消しました。引き続きご利用いただけます。")
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

      const { ok, json, isHtmlWrapped } = await parseActionResponse<{
        error: string | null
        data: {
          passType: string
          renewalAmountJpy: number | null
          chargedNowAmountJpy: number
        } | null
      }>(response)

      if (isHtmlWrapped) {
        if (!ok) {
          toast("プラン変更に失敗しました。")
          return
        }
        toast("プラン変更を受け付けました。")
        setTimeout(() => { window.location.reload() }, 1200)
        return
      }

      if (!ok || json?.error || !json?.data) {
        toast(json?.error ?? "プラン変更に失敗しました。")
        return
      }

      const nextPassName = toPassName(
        (json.data.passType as "LITE" | "STANDARD" | "PREMIUM" | "TWO_DAYS") ?? passType,
      )
      const chargedNowAmountJpy = json.data.chargedNowAmountJpy ?? 0
      const renewalAmountJpy = json.data.renewalAmountJpy ?? null

      if (chargedNowAmountJpy > 0) {
        toast(
          `プラン変更が完了しました。${nextPassName}に即時変更し、今回 ${chargedNowAmountJpy}円を決済しました。次回以降は月額${renewalAmountJpy}円です。`,
        )
      } else {
        toast(
          `プラン変更が完了しました。${nextPassName}に変更しました。今回の即時請求はなく、次回以降は月額${renewalAmountJpy}円です。`,
        )
      }
      setTimeout(() => {
        window.location.reload()
      }, 1200)
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

  useEffect(() => {
    const loadCancellationStatus = async () => {
      if (!currentPass) {
        return
      }

      try {
        const headers = await withAuthHeader()
        const response = await fetch("/api/stripe/subscription-status", {
          method: "POST",
          headers,
        })

        const { ok, json, isHtmlWrapped, statusHint } = await parseActionResponse<{
          error: string | null
          data: { status: string | null } | null
        }>(response)

        if (isHtmlWrapped) {
          setIsCancelScheduled(
            statusHint === "cancellation_requested" ||
              statusHint === "canceled",
          )
          return
        }

        if (!ok || json?.error || !json?.data) {
          return
        }

        setIsCancelScheduled(
          json.data.status === "cancellation_requested" ||
            json.data.status === "canceled",
        )
      } catch {
        // no-op: fallback to optimistic local state
      }
    }

    loadCancellationStatus()
  }, [currentPass])

  return (
    <>
      {currentPass ? (
        <>
          {/* 解約予約中バナー */}
          {isCancelScheduled && (
            <div className="mb-4 rounded-lg border border-orange-300 bg-orange-50 px-4 py-3 dark:border-orange-700 dark:bg-orange-950/40">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="font-bold text-orange-800 text-sm dark:text-orange-300">
                    {"解約予約中"}
                  </p>
                  <p className="mt-0.5 text-orange-700 text-sm dark:text-orange-400">
                    {`${nextDateText} に解約されます。それまでは引き続きご利用いただけます。`}
                  </p>
                  <p className="mt-1 text-orange-600 text-xs dark:text-orange-500">
                    {"解約を取り消したい場合は「解約を取り消す」ボタンを押してください。"}
                  </p>
                </div>
              </div>
            </div>
          )}
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
                  <span className="mr-2 mb-2 rounded-full bg-gray-200 px-3 py-1 font-semibold text-gray-700 text-sm dark:bg-gray-700 dark:text-gray-200">
                    {isCancelScheduled ? "解約予定日" : "次回の請求日"}
                  </span>
                  <p>{nextDateText}</p>
                </div>
                {!isCancelScheduled && (
                  <div className="flex">
                    <span className="mr-2 mb-2 rounded-full bg-gray-200 px-3 py-1 font-semibold text-gray-700 text-sm dark:bg-gray-700 dark:text-gray-200">
                      {"次回の請求額"}
                    </span>
                    <p>{`${currentPass.price}円（税込）`}</p>
                  </div>
                )}
              </div>
              <p>
                {
                  "この画面からサブスクのキャンセルとプラン変更を行えます。"
                }
              </p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {isCancelScheduled ? (
                  /* 解約予約中 → 取り消しボタンを目立たせる */
                  <Button
                    className="w-full bg-green-600 font-bold text-white hover:bg-green-700 dark:bg-green-600 dark:text-white dark:hover:bg-green-700"
                    onClick={onResumeSubscription}
                    disabled={isSubmitting}
                  >
                    {"解約を取り消す（継続する）"}
                  </Button>
                ) : (
                  /* 通常時 → 解約ボタン */
                  <Button
                    className="w-full border-black text-black hover:bg-black/5 dark:border-white dark:bg-transparent dark:text-white dark:hover:bg-white/10"
                    onClick={onCancelCurrentSubscription}
                    disabled={isSubmitting}
                    variant="outline"
                  >
                    {"サブスクをキャンセルする"}
                  </Button>
                )}
                {!isCancelScheduled && currentPass.type === "LITE" && (
                  <Button
                    className="w-full bg-[#00A3FF] font-extrabold text-white tracking-wide shadow-[0_8px_20px_rgba(0,163,255,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0089d9] hover:shadow-[0_12px_28px_rgba(0,137,217,0.45)] dark:bg-[#00A3FF] dark:text-white dark:hover:bg-[#0089d9]"
                    onClick={() => onChangeCurrentPlan("STANDARD", currentPass.type)}
                    disabled={isSubmitting}
                  >
                    {"スタンダードに変更する"}
                  </Button>
                )}
                {!isCancelScheduled && currentPass.type === "LITE" && (
                  <Button
                    className="w-full bg-[#00A3FF] font-extrabold text-white tracking-wide shadow-[0_8px_20px_rgba(0,163,255,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0089d9] hover:shadow-[0_12px_28px_rgba(0,137,217,0.45)] dark:bg-[#00A3FF] dark:text-white dark:hover:bg-[#0089d9]"
                    onClick={() => onChangeCurrentPlan("PREMIUM", currentPass.type)}
                    disabled={isSubmitting}
                  >
                    {"プレミアムに変更する"}
                  </Button>
                )}
                {!isCancelScheduled && currentPass.type === "STANDARD" && (
                  <Button
                    className="w-full bg-[#00A3FF] font-extrabold text-white tracking-wide shadow-[0_8px_20px_rgba(0,163,255,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0089d9] hover:shadow-[0_12px_28px_rgba(0,137,217,0.45)] dark:bg-[#00A3FF] dark:text-white dark:hover:bg-[#0089d9]"
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
          {(isCancelScheduled || currentPass.type !== "PREMIUM") && (
            <PlusAbout
              showUpgradePlansOnly={!isCancelScheduled}
              treatAsNoCurrentPass={isCancelScheduled}
            />
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
