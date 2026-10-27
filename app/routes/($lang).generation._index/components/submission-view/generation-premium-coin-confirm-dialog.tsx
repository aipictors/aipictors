import { useState } from "react"
import { PremiumCoinIcon } from "~/components/premium-coin-icon"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Checkbox } from "~/components/ui/checkbox"
import { Label } from "~/components/ui/label"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  /** 使う見込みのプレミアムコイン（null なら閉じている） */
  premiumCoinAmount: number | null
  onConfirm: (props: { isNeverAskAgain: boolean }) => void
  onCancel: () => void
}

/**
 * フリーコインが足りずプレミアムコインを使うときの確認
 */
export function GenerationPremiumCoinConfirmDialog(props: Props) {
  const t = useTranslation()

  const [isNeverAskAgain, setIsNeverAskAgain] = useState(false)

  return (
    <AlertDialog
      open={props.premiumCoinAmount !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) props.onCancel()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <PremiumCoinIcon className="h-5 w-5 shrink-0" />
            {t("プレミアムコインを使います", "Premium coins will be used")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              `フリーコインが足りないため、この生成でプレミアムコインを${props.premiumCoinAmount ?? 0}枚使います。生成しますか？`,
              `You don't have enough free coins, so this generation will use ${props.premiumCoinAmount ?? 0} premium coins. Continue?`,
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center gap-2">
          <Checkbox
            id="premium-coin-never-ask"
            checked={isNeverAskAgain}
            onCheckedChange={(checked) => setIsNeverAskAgain(checked === true)}
          />
          <Label htmlFor="premium-coin-never-ask" className="text-sm">
            {t(
              "次から確認しない（設定 > コインで戻せます）",
              "Don't ask again (can be changed in Settings > Coins)",
            )}
          </Label>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("やめる", "Cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => props.onConfirm({ isNeverAskAgain })}
          >
            {t("生成する", "Generate")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
