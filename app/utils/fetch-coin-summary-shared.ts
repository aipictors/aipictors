let inFlight: Promise<Response> | null = null

/**
 * 残高の取得（/api/coins/summary）を、同時に呼ばれた分だけ 1 回にまとめる。
 * ヘッダーのメニューやバナーがページを開いたときにそれぞれ呼んでいて、1 回ごとに付与・失効の確認を書き込みまで行うので重い。
 * 終わったら覚えないので、コインを使った直後の取り直しには影響しない
 */
export const fetchCoinSummaryShared = (headers: HeadersInit) => {
  inFlight ??= fetch("/api/coins/summary", { headers }).finally(() => {
    inFlight = null
  })
  return inFlight.then((response) => response.clone())
}
