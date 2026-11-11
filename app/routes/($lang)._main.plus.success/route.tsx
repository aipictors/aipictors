import { Button } from "~/components/ui/button"
import { Link } from "~/lib/app/locale-router"
import { useSearchParams } from "@remix-run/react"
import { Loader2, ThumbsUpIcon } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import { toDateText } from "~/utils/to-date-text"

/**
 * サブスクの決済を完了した場合のページ
 * 自動更新なしのパス（?prepaid=1&session_id=）のときは、ここで反映を確かめる（webhook でも反映される）
 */
export default function PlusSuccess () {
  const [searchParams] = useSearchParams()

  const authContext = useContext(AuthContext)

  const sessionId = searchParams.get("session_id")

  const isPrepaid = searchParams.get("prepaid") === "1" && sessionId !== null

  const [prepaidState, setPrepaidState] = useState<
    | { kind: "loading" }
    | { kind: "done"; periodEnd: number | null }
    | { kind: "pending" }
  >({ kind: "loading" })

  useEffect(() => {
    if (!isPrepaid || authContext.isLoading || authContext.isNotLoggedIn) return
    let isCancelled = false
    const confirm = async (attempt: number) => {
      try {
        const headers = await getViewerRequestHeaders({ includeJsonContentType: true })
        const response = await fetch("/api/stripe/prepaid-pass-confirm", {
          method: "POST",
          headers,
          body: JSON.stringify({ sessionId }),
        })
        const json = (await response.json().catch(() => null)) as {
          data: { reflected: boolean; periodEnd?: number } | null
        } | null
        if (isCancelled) return
        if (json?.data?.reflected) {
          setPrepaidState({ kind: "done", periodEnd: json.data.periodEnd ?? null })
          return
        }
      } catch {
        // 下で再試行する
      }
      if (attempt < 5) {
        setTimeout(() => confirm(attempt + 1), 2000)
      } else if (!isCancelled) {
        setPrepaidState({ kind: "pending" })
      }
    }
    confirm(0)
    return () => {
      isCancelled = true
    }
  }, [isPrepaid, authContext.isLoading, authContext.isNotLoggedIn])

  return (
    <>
      <div className="mx-auto w-full max-w-sm space-y-16 px-6 pt-16">
        <div className="space-y-4">
          <div className="flex w-full justify-center">
            <ThumbsUpIcon className="size-16" />
          </div>
          <div className="space-y-2">
            <p className="flex justify-center font-bold text-xl">
              {"決済に成功しました"}
            </p>
            {isPrepaid ? (
              prepaidState.kind === "loading" ? (
                <p className="flex items-center justify-center gap-2 text-sm">
                  <Loader2 className="size-4 animate-spin" />
                  {"プランを反映しています..."}
                </p>
              ) : prepaidState.kind === "done" ? (
                <p>
                  {prepaidState.periodEnd
                    ? `ご購入ありがとうございます。${toDateText(prepaidState.periodEnd)} までプランをご利用いただけます（自動更新はありません）。`
                    : "ご購入ありがとうございます。プランをご利用いただけます（自動更新はありません）。"}
                </p>
              ) : (
                <p className="text-sm">
                  {"お支払いは完了しています。プランの反映に少し時間がかかっています。数分たっても反映されないときは、お問い合わせからご連絡ください。"}
                </p>
              )
            ) : (
              <p>
                {
                  "この度はAipictors+にご登録ありがとうございます。これからもよろしくお願いします。"
                }
              </p>
            )}
          </div>
          <div className="flex justify-center">
            <Link to="/plus" replace>
              <Button>{"Plusに戻る"}</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
