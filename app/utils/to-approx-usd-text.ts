/**
 * 円をドルの目安にする割合。料金の請求は円で、ドルの額は英語表示に添える目安。
 * 2026-11-11 時点で 1 円 = 0.00628 ドル（1 ドル = 約 159 円）。大きく動いたらここだけ直す
 */
export const USD_PER_JPY = 0.0063

/**
 * 海外の人向けの料金の目安（例: about $12）。10 ドル未満は小数 1 桁まで
 */
export const toApproxUsdText = (yen: number): string => {
  const usd = yen * USD_PER_JPY
  return `about $${usd < 10 ? Number(usd.toFixed(1)) : Math.round(usd)}`
}
