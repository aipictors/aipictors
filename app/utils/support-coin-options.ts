export type SupportCoinType = "FREE" | "PREMIUM"

/**
 * 推すときのよく使う枚数。フリーは 10〜300（50 もワンタップで）、
 * プレミアムは少額の 1・2 枚と、100 枚・色の区切り 500・1,000 枚（3,000 枚などは −/＋ と入力で選べる）
 */
export const SUPPORT_COIN_OPTIONS: Record<SupportCoinType, readonly number[]> =
  {
    FREE: [10, 20, 30, 50, 100, 300],
    PREMIUM: [1, 2, 100, 500, 1000],
  }

/**
 * コインの種類を選んだときの最初の枚数。フリーはよく使う最小の枚数（残高まで）、
 * プレミアムは 0（入力欄を空にして、消さずにそのまま枚数を打てるように）
 */
export const toInitialSupportCoinAmount = (
  type: SupportCoinType,
  balance: number,
): number => {
  if (type === "PREMIUM") return 0
  return Math.max(0, Math.min(SUPPORT_COIN_OPTIONS.FREE[0], balance))
}
