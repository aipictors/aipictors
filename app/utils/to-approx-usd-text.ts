/** 円をドルの目安にする割合（請求は円なので目安。2026-11 のレート） */
const USD_PER_JPY = 0.0063

/**
 * 海外の人向けの料金の目安（例: ≈ $12）
 */
export const toApproxUsdText = (yen: number): string => {
  const usd = yen * USD_PER_JPY
  return `≈ $${usd < 10 ? Number(usd.toFixed(1)) : Math.round(usd)}`
}
