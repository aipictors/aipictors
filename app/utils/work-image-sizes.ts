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

/**
 * 複数枚の作品で、画像ごとの大きさの手がかり（元の幅・縦横比）を返す。
 * 分かっているのはメイン画像（1 枚目）の値だけなので、2 枚目以降には使わない。
 * 以前は全部の画像に 1 枚目の値を使っていたので、1 枚目が縦長で後ろに横長の画像があると、
 * 横長の画像も縦長として小さい縮小版（元の幅も 1 枚目の幅まで）が選ばれ、粗く見えていた
 */
export const pickWorkImageSizeHint = <T>(
  url: string,
  imageURLs: string[],
  mainImageHint: T | undefined,
): T | undefined => (url === imageURLs[0] ? mainImageHint : undefined)

/**
 * 作品ページのメイン画像（1 枚の作品）の大きさのクラス。
 * 高さを h-full（親の高さの %）にすると、Safari では読み込み前（枠の高さだけ確保していたとき）の
 * 大きさのまま描き直されず、画像が帯のように小さく出たり幅 0 で消えたりした（更新すると戻る）。
 * 幅・高さは auto にして、上限（max-w・max-h）の中で縦横比のまま出す。上限の 64vh・72vh は
 * toWorkImageSizes の見込みと合わせている
 */
export const WORK_MAIN_IMAGE_SIZE_CLASS_NAME =
  "h-auto w-auto max-w-full max-h-[64vh] md:max-h-[72vh]"
