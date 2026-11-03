import { useRef, useState } from "react"
import { useLocalStorage } from "usehooks-ts"
import { PREMIUM_COIN_CONFIRM_STORAGE_KEY } from "~/routes/($lang).generation._index/utils/premium-coin-confirm"

/**
 * プレミアムコインを使う前の確認
 */
export function usePremiumCoinConfirm() {
  const [isPremiumCoinConfirmEnabled, setIsPremiumCoinConfirmEnabled] =
    useLocalStorage(PREMIUM_COIN_CONFIRM_STORAGE_KEY, true)

  // プレミアムコインを使う前の確認（開いている間は使う見込みの枚数を持つ）
  const [premiumCoinConfirmAmount, setPremiumCoinConfirmAmount] = useState<
    number | null
  >(null)
  const premiumCoinConfirmResolveRef = useRef<
    ((isConfirmed: boolean) => void) | null
  >(null)

  const settlePremiumCoinConfirm = (isConfirmed: boolean) => {
    premiumCoinConfirmResolveRef.current?.(isConfirmed)
    premiumCoinConfirmResolveRef.current = null
    setPremiumCoinConfirmAmount(null)
  }

  const confirmPremiumCoinUse = (amount: number) => {
    return new Promise<boolean>((resolve) => {
      premiumCoinConfirmResolveRef.current = resolve
      setPremiumCoinConfirmAmount(amount)
    })
  }

  return {
    isPremiumCoinConfirmEnabled,
    setIsPremiumCoinConfirmEnabled,
    premiumCoinConfirmAmount,
    settlePremiumCoinConfirm,
    confirmPremiumCoinUse,
  }
}
