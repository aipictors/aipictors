import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { useTranslation } from "~/hooks/use-translation"
import type { WorkCommentListState } from "~/routes/($lang)._main.posts.$post._index/hooks/use-work-comment-list"

/**
 * プレミアムコインの購入から戻ってきたときの結果
 */
export function WorkCommentPremiumResultDialog(
  props: Pick<
    WorkCommentListState,
    | "clearPremiumCheckoutSearchParams"
    | "confirmedPremiumCoins"
    | "isConfirmingPremiumPurchase"
    | "isPremiumPurchaseResultDialogOpen"
    | "premiumPurchaseError"
    | "setIsPremiumPurchaseResultDialogOpen"
  >,
) {
  const t = useTranslation()
  const {
    clearPremiumCheckoutSearchParams,
    confirmedPremiumCoins,
    isConfirmingPremiumPurchase,
    isPremiumPurchaseResultDialogOpen,
    premiumPurchaseError,
    setIsPremiumPurchaseResultDialogOpen,
  } = props

  return (
    <Dialog
      open={isPremiumPurchaseResultDialogOpen}
      onOpenChange={(open) => {
        setIsPremiumPurchaseResultDialogOpen(open)
        if (!open) {
          clearPremiumCheckoutSearchParams()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("プレミアムコイン購入完了", "Premium coin purchase complete")}
          </DialogTitle>
          <DialogDescription>
            {isConfirmingPremiumPurchase
              ? t(
                  "購入内容を反映しています。残高を更新中です。",
                  "Applying your purchase and refreshing balance.",
                )
              : premiumPurchaseError
                ? premiumPurchaseError
                : confirmedPremiumCoins !== null
                  ? t(
                      `${confirmedPremiumCoins.toLocaleString()}枚のプレミアムコインを反映しました。`,
                      `${confirmedPremiumCoins.toLocaleString()} premium coins were added.`,
                    )
                  : t(
                      "購入完了を確認しました。",
                      "Your purchase has been confirmed.",
                    )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {premiumPurchaseError ? (
            <Button variant="outline" onClick={() => window.location.reload()}>
              {t("再読み込み", "Reload")}
            </Button>
          ) : null}
          <Button
            onClick={() => {
              clearPremiumCheckoutSearchParams()
              setIsPremiumPurchaseResultDialogOpen(false)
            }}
            disabled={isConfirmingPremiumPurchase}
          >
            {t("作品に戻る", "Back to work")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
