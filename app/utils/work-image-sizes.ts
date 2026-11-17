/**
 * 作品ページのメイン画像の sizes（表示される幅の見込み）。
 *
 * パソコン（768px 以上）では、左のメニューと余白を除いた幅（画面幅 − 424px ほど）が上限で、
 * 高さは 72vh まで（スマホは 64vh まで）。横長の画像は幅で、縦長の画像は高さで大きさが決まる。
 * 以前は 60vw としていたが、1920px の画面では実際は 1300〜1500px ほどで表示されるため、
 * 小さい縮小版が選ばれて引き伸ばされ、横長の画像が粗く見えていた。
 *
 * 計算（100vw - 424px、72vh * 1.5 など）は書かず、vw と整数の vh だけにする。
 * Cloudflare の Early Hints（103）が Link ヘッダーの imagesizes を写すとき、
 * 計算の入った値は最初のカンマで切ってしまい、壊れた sizes（画面幅いっぱいとみなされる）になっていた。
 * 画面幅 − 424px は、1600px 以上は 80vw、それより狭いパソコンは 70vw で近づける（どちらも少し大きめ）
 */
const PC_WIDE = "(min-width: 1600px)"
const PC = "(min-width: 768px)"

export const toWorkImageSizes = (aspectRatio: number | undefined): string => {
  if (!aspectRatio || !Number.isFinite(aspectRatio) || aspectRatio <= 0) {
    return `${PC_WIDE} 80vw, ${PC} 70vw, 100vw`
  }
  const pcHeight = `${Math.round(72 * aspectRatio)}vh`
  const mobileHeight = `${Math.round(64 * aspectRatio)}vh`
  return `${PC_WIDE} min(80vw, ${pcHeight}), ${PC} min(70vw, ${pcHeight}), min(100vw, ${mobileHeight})`
}
