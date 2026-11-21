/**
 * ガチャ演出をどれだけ重く出すかを、回線の速さから決める。
 * - full: 3D の演出（ぴくたーちゃんのモデル 約 1.8MB）
 * - lite: 3D の演出、軽いモデル（テクスチャを小さくした 約 1.1MB）
 * - card: 3D を読まず、カードがめくれる 2D の演出だけ
 *
 * navigator.connection（Android の Chrome など）があればそれを使う。
 * iPhone の Safari にはないので、そのページで読み込んだ大きめのファイルの速さから見積もる
 */

export type GachaQuality = "full" | "lite" | "card"

export type ConnectionHint = {
  saveData?: boolean
  effectiveType?: string
  /** Mbps */
  downlink?: number
}

export type TransferSample = {
  /** 受け取ったバイト数（キャッシュから読んだものは 0） */
  transferSize: number
  /** ミリ秒 */
  duration: number
}

/** この速さ（Mbps）より遅ければ軽いモデル */
const LITE_BELOW_MBPS = 4
/** この速さ（Mbps）より遅ければ 3D をやめてカードだけ */
const CARD_BELOW_MBPS = 0.8
/** 速さを見積もるのに使うファイルの大きさの下限（小さいファイルは待ち時間ばかりで当てにならない） */
const MIN_SAMPLE_BYTES = 30_000

/** 読み込んだファイルから回線の速さ（Mbps）を見積もる。見積もれなければ null */
export const estimateMbps = (samples: readonly TransferSample[]) => {
  const speeds = samples
    .filter(
      (sample) =>
        sample.transferSize >= MIN_SAMPLE_BYTES && sample.duration > 0,
    )
    .map((sample) => (sample.transferSize * 8) / 1000 / sample.duration)
    .sort((a, b) => b - a)
  if (speeds.length === 0) return null
  // 同時に読んだファイルで帯域を分け合うので、速いほうの半分の真ん中を使う
  const fast = speeds.slice(0, Math.max(1, Math.ceil(speeds.length / 2)))
  return fast[Math.floor((fast.length - 1) / 2)]
}

export const pickGachaQuality = (props: {
  connection?: ConnectionHint | null
  samples?: readonly TransferSample[]
}): GachaQuality => {
  const connection = props.connection
  if (connection?.saveData) return "card"
  if (
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g"
  )
    return "card"
  if (connection?.effectiveType === "3g") return "lite"
  const mbps =
    typeof connection?.downlink === "number" && connection.downlink > 0
      ? connection.downlink
      : estimateMbps(props.samples ?? [])
  if (mbps === null) return "full"
  if (mbps < CARD_BELOW_MBPS) return "card"
  if (mbps < LITE_BELOW_MBPS) return "lite"
  return "full"
}

/** ブラウザの情報から決める */
export const detectGachaQuality = (): GachaQuality => {
  if (typeof window === "undefined") return "full"
  const connection = (navigator as Navigator & { connection?: ConnectionHint })
    .connection
  const samples = performance
    .getEntriesByType("resource")
    .map((entry) => entry as PerformanceResourceTiming)
    .map((entry) => ({
      transferSize: entry.transferSize,
      // 最初の 1 バイトが届いてから読み終わるまで（待ち時間を除く）
      duration: entry.responseEnd - entry.responseStart,
    }))
  return pickGachaQuality({ connection, samples })
}
