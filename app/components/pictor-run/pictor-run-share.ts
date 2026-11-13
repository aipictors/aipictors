/**
 * ミニゲーム「ぴくたーちゃんラン」の結果のシェア（カード画像・シェア用のページ）
 */

const CARD_ORIGIN = "https://card.aipictors.com"

const SITE_ORIGIN = "https://www.aipictors.com"

export type PictorRunShareResult = {
  score: number
  coins: number
  /** 到達したステージ（0 始まりの通し番号） */
  stage: number
  /** ログインしている人なら、カードにアイコンと名前を出す */
  userId: string | null
}

const toNumber = (value: number, max: number) =>
  Math.min(max, Math.max(0, Math.floor(Number.isFinite(value) ? value : 0)))

/** シェア用のページの URL の最後に付ける文字（得点-コイン-ステージ[-u利用者の番号]） */
export function toPictorRunShareKey(result: PictorRunShareResult) {
  const user =
    result.userId && /^\d+$/.test(result.userId) ? `-u${result.userId}` : ""
  return `${toNumber(result.score, 200000)}-${toNumber(result.coins, 20000)}-${toNumber(result.stage, 2600)}${user}`
}

export function parsePictorRunShareKey(
  key: string | undefined,
): PictorRunShareResult | null {
  const match = key?.match(/^(\d{1,6})-(\d{1,5})-(\d{1,4})(?:-u(\d{1,12}))?$/)
  if (!match) return null
  return {
    score: toNumber(Number(match[1]), 200000),
    coins: toNumber(Number(match[2]), 20000),
    stage: toNumber(Number(match[3]), 2600),
    userId: match[4] ?? null,
  }
}

/** カードの画像（card.aipictors.com の Worker で作る。キャッシュがクエリ文字列を見ないので、パスに入れる） */
export function toPictorRunCardUrl(result: PictorRunShareResult) {
  const user = result.userId ? `/${result.userId}` : ""
  return `${CARD_ORIGIN}/pictor-run/v1/${result.score}-${result.coins}-${result.stage}${user}.png`
}

/** シェアするページ（X などに貼ると、カードの画像が出る） */
export function toPictorRunSharePageUrl(result: PictorRunShareResult) {
  return `${SITE_ORIGIN}/pictor-chan/run/${toPictorRunShareKey(result)}`
}
