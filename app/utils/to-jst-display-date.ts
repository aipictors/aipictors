/**
 * 表示用の日付（日本時間）を作る。
 *
 * 返り値の「ローカル時刻」（getHours や date-fns の format）が日本時間になるようずらす。
 * サーバー（Cloudflare Workers・UTC）とブラウザのどちらで作っても同じ文字になるので、
 * React の hydration が食い違わない（食い違うとページ全体を作り直して表示が遅くなる）。
 * 表示専用。保存や計算には使わない。
 */
export const toJstDisplayDate = (value: number | Date): Date => {
  const ms = typeof value === "number" ? value : value.getTime()
  const localOffsetMinutes = new Date(ms).getTimezoneOffset()
  return new Date(ms + (9 * 60 + localOffsetMinutes) * 60 * 1000)
}
