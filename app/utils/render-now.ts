/**
 * 「◯分前」のような経過時間の表示に使う「いま」。
 *
 * ページはサーバーで描画して Cloudflare に数分キャッシュするので、ブラウザが表示を引き継ぐ（hydration）とき、
 * その場の時刻で計算するとサーバーの文字と食い違い、React がページ全体を作り直してしまう。
 * 引き継ぎが終わるまではサーバーが描画した時刻を「いま」として使い、終わったら本当の時刻に戻す。
 */
let renderNow: number | null = null

export const setRenderNow = (value: number | null) => {
  renderNow = value
}

export const getRenderNow = (): number => {
  return renderNow ?? Date.now()
}
