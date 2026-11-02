/**
 * コインの枚数を step ぶん増減する（0〜max の範囲）。
 * 長押しで step が大きくなったときは 10, 20, 30… のようにきりのいい数に揃える
 */
export const stepCoinAmount = (
  value: number,
  direction: 1 | -1,
  step: number,
  max: number,
): number => {
  const upperLimit = Math.max(0, max)
  const next =
    direction === 1
      ? (Math.floor(value / step) + 1) * step
      : (Math.ceil(value / step) - 1) * step
  return Math.min(Math.max(0, next), upperLimit)
}
