/**
 * 作品ページのメイン画像の sizes（表示される幅の見込み）。
 *
 * パソコン（768px 以上）では、左のメニュー（232px）と余白を除いた幅（画面幅 − 424px）が上限で、
 * 高さは 72vh まで（スマホは 64vh まで）。横長の画像は幅で、縦長の画像は高さで大きさが決まる。
 * 以前は 60vw としていたが、1920px の画面では実際は 1300〜1500px ほどで表示されるため、
 * 小さい縮小版が選ばれて引き伸ばされ、横長の画像が粗く見えていた。
 *
 * 括弧は 1 段までにする（min() の中は calc() なしで計算を書ける）。
 * Cloudflare の Early Hints（103）が Link ヘッダーの imagesizes を写すとき、
 * 括弧が 2 段あると中のカンマで切ってしまい、壊れた sizes になっていた
 */
const PC_COLUMN_WIDTH = "100vw - 424px"

export const toWorkImageSizes = (aspectRatio: number | undefined): string => {
  if (!aspectRatio || !Number.isFinite(aspectRatio) || aspectRatio <= 0) {
    return `(min-width: 768px) calc(${PC_COLUMN_WIDTH}), 100vw`
  }
  const ratio = Math.round(aspectRatio * 1000) / 1000
  return `(min-width: 768px) min(${PC_COLUMN_WIDTH}, 72vh * ${ratio}), min(100vw, 64vh * ${ratio})`
}
