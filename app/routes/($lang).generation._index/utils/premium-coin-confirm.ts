/**
 * 生成でプレミアムコインを使う前に確認するか（localStorage、既定は確認する）
 * 生成画面の確認ダイアログと設定 > コインの両方から切り替える
 */
export const PREMIUM_COIN_CONFIRM_STORAGE_KEY = "generation.confirmPremiumCoin"

/**
 * 1 回の生成で使うプレミアムコインの見込み（フリーコインを先に使う）
 */
export function estimatePremiumCoinUse(props: {
  requestCoinCost: number
  freeBalance: number
  premiumBalance: number
}) {
  const shortage = Math.max(0, props.requestCoinCost - props.freeBalance)
  return Math.min(shortage, Math.max(0, props.premiumBalance))
}
