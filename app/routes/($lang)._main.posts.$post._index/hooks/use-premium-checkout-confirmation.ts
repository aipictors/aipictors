import {
  useEffect,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react"
import { toast } from "sonner"
import type { useLocation } from "@remix-run/react"
import type { AuthContext } from "~/contexts/auth-context"
import type { TranslationFn } from "~/hooks/use-translation"
import type { useNavigate } from "~/lib/app/locale-router"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import type { PremiumConfirmResponse } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list-utils"

/**
 * プレミアムコインの決済から戻ってきたときの確認（URL の checkout と session_id を見る）
 */
export function usePremiumCheckoutConfirmation(args: {
  appContext: React.ContextType<typeof AuthContext>
  checkoutSessionId: string | null
  checkoutState: string | null
  clearPremiumCheckoutSearchParams: () => void
  handledPremiumCheckoutSessionRef: MutableRefObject<string | null>
  location: ReturnType<typeof useLocation>
  navigate: ReturnType<typeof useNavigate>
  reloadCoinSummary: () => Promise<void>
  setConfirmedPremiumCoins: Dispatch<SetStateAction<number | null>>
  setIsConfirmingPremiumPurchase: Dispatch<SetStateAction<boolean>>
  setIsPremiumPurchaseDialogOpen: Dispatch<SetStateAction<boolean>>
  setIsPremiumPurchaseResultDialogOpen: Dispatch<SetStateAction<boolean>>
  setPremiumPurchaseError: Dispatch<SetStateAction<string | null>>
  t: TranslationFn
}) {
  const {
    appContext,
    checkoutSessionId,
    checkoutState,
    clearPremiumCheckoutSearchParams,
    handledPremiumCheckoutSessionRef,
    location,
    navigate,
    reloadCoinSummary,
    setConfirmedPremiumCoins,
    setIsConfirmingPremiumPurchase,
    setIsPremiumPurchaseDialogOpen,
    setIsPremiumPurchaseResultDialogOpen,
    setPremiumPurchaseError,
    t,
  } = args

  useEffect(() => {
    if (checkoutState === "premium-cancel") {
      if (handledPremiumCheckoutSessionRef.current === "premium-cancel") {
        return
      }
      handledPremiumCheckoutSessionRef.current = "premium-cancel"
      toast.message(
        t(
          "プレミアムコインの購入をキャンセルしました",
          "Premium coin purchase was canceled",
        ),
      )
      clearPremiumCheckoutSearchParams()
      return
    }

    if (checkoutState !== "premium-success") {
      return
    }

    setIsPremiumPurchaseDialogOpen(false)
    setIsPremiumPurchaseResultDialogOpen(true)
    setPremiumPurchaseError(null)
    setConfirmedPremiumCoins(null)

    if (appContext.isLoading) {
      setIsConfirmingPremiumPurchase(true)
      return
    }

    if (!appContext.isLoggedIn) {
      setIsConfirmingPremiumPurchase(false)
      setPremiumPurchaseError(
        t(
          "ログイン状態の確認中に購入完了処理を開始できませんでした。再読み込み後にもう一度ご確認ください。",
          "Could not start purchase confirmation because login state was not ready. Please reload and check again.",
        ),
      )
      return
    }

    if (checkoutSessionId && !checkoutSessionId.startsWith("cs_")) {
      handledPremiumCheckoutSessionRef.current = checkoutSessionId
      setPremiumPurchaseError(
        t(
          "購入情報が不正です。もう一度購入画面からお試しください。",
          "Invalid checkout session. Please retry from the purchase dialog.",
        ),
      )
      clearPremiumCheckoutSearchParams()
      return
    }

    if (!checkoutSessionId) {
      handledPremiumCheckoutSessionRef.current = "missing-session"
      setConfirmedPremiumCoins(null)
      setIsConfirmingPremiumPurchase(false)
      setPremiumPurchaseError(
        t(
          "購入情報の確認に必要なセッションIDが見つかりませんでした",
          "Missing checkout session ID for premium coin confirmation",
        ),
      )
      return
    }

    const checkoutKey = checkoutSessionId
    if (handledPremiumCheckoutSessionRef.current === checkoutKey) {
      return
    }
    handledPremiumCheckoutSessionRef.current = checkoutKey

    const confirmPremiumPurchase = async () => {
      try {
        setIsConfirmingPremiumPurchase(true)

        const headers = await getViewerRequestHeaders({
          includeJsonContentType: true,
        })
        const response = await fetch("/api/stripe/premium-coins-confirm", {
          method: "POST",
          headers,
          body: JSON.stringify({ sessionId: checkoutSessionId }),
        })

        const json = (await response.json()) as PremiumConfirmResponse

        const paymentStatus = json.data?.paymentStatus ?? null

        if (
          !response.ok ||
          json.error ||
          (!json.data?.reflected &&
            paymentStatus !== "rate_limited" &&
            paymentStatus !== "pending")
        ) {
          throw new Error(
            json.error ??
              (json.data?.paymentStatus === "paid"
                ? t(
                    "購入内容の反映に失敗しました。再読み込み後も反映されない場合はお問い合わせください。",
                    "Failed to reflect the purchase. If it still does not appear after reloading, please contact support.",
                  )
                : t(
                    "購入完了を確認できませんでした",
                    "Could not confirm the completed purchase",
                  )),
          )
        }

        if (!json.data?.reflected && paymentStatus === "rate_limited") {
          setPremiumPurchaseError(
            t(
              "決済は完了しています。現在反映処理が混み合っているため、しばらくしてから残高をご確認ください。",
              "Your payment is complete. Reflection is temporarily delayed due to high load. Please check your balance again shortly.",
            ),
          )
          clearPremiumCheckoutSearchParams()
          return
        }

        if (!json.data?.reflected && paymentStatus === "pending") {
          setPremiumPurchaseError(
            t(
              "決済確認中です。しばらくしてから残高をご確認ください。",
              "Payment confirmation is in progress. Please check your balance again shortly.",
            ),
          )
          clearPremiumCheckoutSearchParams()
          return
        }

        setConfirmedPremiumCoins(json.data?.totalCoins ?? null)
        await reloadCoinSummary()
        clearPremiumCheckoutSearchParams()
      } catch (error) {
        setConfirmedPremiumCoins(null)
        const message =
          error instanceof Error
            ? error.message
            : t("エラーが発生しました", "An error occurred")
        setPremiumPurchaseError(message)
        toast.error(message)
      } finally {
        setIsConfirmingPremiumPurchase(false)
      }
    }

    void confirmPremiumPurchase()
  }, [
    appContext.isLoading,
    appContext.isLoggedIn,
    checkoutSessionId,
    checkoutState,
    location.pathname,
    navigate,
    t,
  ])
}
