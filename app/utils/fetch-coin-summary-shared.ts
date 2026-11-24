const inFlight = new Map<string, Promise<Response>>()

/** 推す相手の状態（/api/coins/summary?supportTo= のときだけ返る） */
export type CoinSummarySupportTarget = {
  userId: string
  /** 推しを受け付けている（作者が「推しを受け付けない」にしていない）。古い API では無い */
  supportAccepted?: boolean
  /** プレミアムコインで推せる（作者が「プレミアムコインでの推しを受け取らない」にしていない） */
  premiumAccepted: boolean
  /** フリーコインの推しがコインとして作者に届く（作者が「推しでフリーコインを受け取らない」にしていない）。古い API では無い */
  freeReceiveAccepted?: boolean
  /** 作者がクリエイター報酬に参加中 */
  rewardJoined: boolean
}

/**
 * 残高の取得（/api/coins/summary）を、同時に呼ばれた分だけ 1 回にまとめる。
 * ヘッダーのメニューやバナーがページを開いたときにそれぞれ呼んでいて、1 回ごとに付与・失効の確認を書き込みまで行うので重い。
 * 終わったら覚えないので、コインを使った直後の取り直しには影響しない。
 * supportTargetUserId を渡すと、推す相手の状態（supportTarget）も同じ応答で受け取る
 */
export const fetchCoinSummaryShared = (
  headers: HeadersInit,
  supportTargetUserId?: string | null,
) => {
  const url = supportTargetUserId
    ? `/api/coins/summary?supportTo=${encodeURIComponent(supportTargetUserId)}`
    : "/api/coins/summary"
  let request = inFlight.get(url)
  if (!request) {
    request = fetch(url, { headers }).finally(() => {
      inFlight.delete(url)
    })
    inFlight.set(url, request)
  }
  return request.then((response) => response.clone())
}
