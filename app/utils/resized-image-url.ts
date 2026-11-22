/**
 * files.aipictors.com の画像を、表示サイズに縮小した版の URL にする。
 *
 * 縮小版は R2（image-variants）のカスタムドメイン variants.aipictors.com から直接配る
 * （Worker も Snippet も通らない。キャッシュルールでエッジに 1 年置く）。
 * まだ作られていない幅は 404 になるので、RESIZED_IMAGE_FALLBACK_SCRIPT が
 * 縮小の Worker（files.aipictors.com/_w/<幅>/<キー>、aipictors-cron の image-resize-worker）に切り替える。
 * Worker が作った縮小版は R2 に保存され、次からは variants.aipictors.com で見つかる。
 * アニメーション画像などは Worker が元の画像をそのまま返す。
 */

const RESIZABLE_ORIGIN = "https://files.aipictors.com/"

/** 縮小版の置き場所（R2 image-variants の公開ドメイン。キーは v2/<幅>/<元のキー>） */
export const RESIZED_IMAGE_ORIGIN = "https://variants.aipictors.com"

const VARIANT_PREFIX = `${RESIZED_IMAGE_ORIGIN}/v2/`

/** 縮小版を作る Worker のルート */
const RESIZE_WORKER_PREFIX = `${RESIZABLE_ORIGIN}_w/`

/**
 * 使う幅（Worker 側の WIDTHS に含まれるもの）。
 * 種類が多いほど縮小の処理と R2 への保存が増えるので絞っている
 */
const RESIZED_IMAGE_WIDTHS = [96, 240, 480, 640, 800, 1280] as const

/**
 * 作品ページのメイン画像だけで使う大きい幅（Worker 側の WIDTHS に含まれるもの）。
 * パソコンで横長の画像を大きく出すと 1280px では足りず引き伸ばされて粗く見えるので、
 * 元画像の幅が分かっているときだけ、元画像より小さい幅を候補に足す
 */
const LARGE_RESIZED_IMAGE_WIDTHS = [1920, 2560] as const

function isResizable(url: string | null | undefined): url is string {
  if (!url?.startsWith(RESIZABLE_ORIGIN)) return false
  const key = url.slice(RESIZABLE_ORIGIN.length)
  return key.length > 0 && !key.startsWith("_w/") && !key.includes("?")
}

function pickWidth(
  width: number,
  widths: readonly number[] = RESIZED_IMAGE_WIDTHS,
) {
  return widths.find((w) => w >= width) ?? widths[widths.length - 1]
}

/**
 * 幅 width（以上で一番近い対応幅）に縮小した画像の URL。縮小できない URL はそのまま返す
 */
export function toResizedImageUrl(
  url: string | null | undefined,
  width: number,
): string | undefined {
  if (!url) return undefined
  if (!isResizable(url)) return url
  const key = url.slice(RESIZABLE_ORIGIN.length)
  return `${VARIANT_PREFIX}${pickWidth(width)}/${key}`
}

/**
 * 縮小版の URL が読めなかったときに次に試す URL。
 * R2 に無い縮小版 → 縮小の Worker（作って返す）→ 元の画像。それ以外は null
 */
export function nextResizedImageUrl(url: string): string | null {
  if (url.startsWith(VARIANT_PREFIX)) {
    return RESIZE_WORKER_PREFIX + url.slice(VARIANT_PREFIX.length)
  }
  if (url.startsWith(RESIZE_WORKER_PREFIX)) {
    const key = url.slice(RESIZE_WORKER_PREFIX.length).replace(/^\d+\//, "")
    return RESIZABLE_ORIGIN + key
  }
  return null
}

/**
 * head に置く: 縮小版の <img>（srcset・<picture> の <source> も）が 404 などで読めなかったら、
 * nextResizedImageUrl と同じ順で URL を差し替える。
 * hydration 前の SSR の画像も扱えるように、React ではなく window の capture で受ける。
 * 差し替えたときはイベントを止める（各コンポーネントの onError は最後の元画像でも読めなかったときだけ動く）
 */
export const RESIZED_IMAGE_FALLBACK_SCRIPT = `(function(){var V=${JSON.stringify(VARIANT_PREFIX)},W=${JSON.stringify(RESIZE_WORKER_PREFIX)},O=${JSON.stringify(RESIZABLE_ORIGIN)};function n(u){if(u.indexOf(V)===0)return W+u.slice(V.length);if(u.indexOf(W)===0)return O+u.slice(W.length).replace(/^\\d+\\//,"");return null}addEventListener("error",function(e){var t=e.target;if(!t||t.tagName!=="IMG")return;var u=t.currentSrc||t.src||"",x=n(u);if(!x)return;e.stopImmediatePropagation();var v=u.indexOf(V)===0;function f(el){var s=el.getAttribute("srcset");if(!s)return;if(v){if(s.indexOf(V)>=0)el.setAttribute("srcset",s.split(V).join(W))}else if(s.indexOf(W)>=0)el.removeAttribute("srcset")}var p=t.parentNode;if(p&&p.tagName==="PICTURE")for(var i=0;i<p.children.length;i++)if(p.children[i].tagName==="SOURCE")f(p.children[i]);f(t);var a=t.getAttribute("src")||"";if(!v)t.setAttribute("src",x);else if(a.indexOf(V)===0)t.setAttribute("src",n(a))},true)})()`

/**
 * object-cover で枠いっぱいに切り抜くときの sizes。
 * 枠より横長の絵は高さで合わせるので、描かれる幅は枠の幅より広くなる。
 * 枠の幅のままだと小さい候補が選ばれて引き伸ばされ、ぼけて見えるので、その分を掛ける。
 * entries は狭い画面の指定を最後に置く（sizes と同じ順。最後の media は無視する）
 */
export function toCoverImageSizes(
  entries: { media?: string; width: string; aspectRatio: number }[],
  imageAspectRatio: number | null | undefined,
): string {
  return entries
    .map((entry, index) => {
      const scale =
        imageAspectRatio && imageAspectRatio > 0
          ? Math.max(1, imageAspectRatio / entry.aspectRatio)
          : 1
      const width =
        scale > 1.05
          ? `calc(${entry.width} * ${Math.round(scale * 100) / 100})`
          : entry.width
      const isLast = index === entries.length - 1
      return entry.media && !isLast ? `${entry.media} ${width}` : width
    })
    .join(", ")
}

/**
 * srcset 用の文字列。maxWidth（元画像の幅）を超える幅は作らない。
 * 一番大きい候補も元画像ではなく再圧縮版にする（元画像は画質が高く重い）。
 * large は元画像の幅（maxWidth）が分かっている大きい表示用で、1920・2560px も候補にする
 */
export function toResizedImageSrcSet(
  url: string | null | undefined,
  options: { minWidth?: number; maxWidth?: number; large?: boolean } = {},
): string | undefined {
  if (!isResizable(url)) return undefined
  const minWidth = options.minWidth ?? 0
  const maxWidth = options.maxWidth ?? Number.POSITIVE_INFINITY
  const allWidths: readonly number[] =
    options.large && Number.isFinite(maxWidth)
      ? [...RESIZED_IMAGE_WIDTHS, ...LARGE_RESIZED_IMAGE_WIDTHS]
      : RESIZED_IMAGE_WIDTHS
  const key = url.slice(RESIZABLE_ORIGIN.length)
  const toUrl = (w: number) =>
    `${VARIANT_PREFIX}${pickWidth(w, allWidths)}/${key}`
  const widths = allWidths.filter((w) => w >= minWidth && w < maxWidth)
  const entries = widths.map((w) => `${toUrl(w)} ${w}w`)
  // large で元画像が一番大きい幅より大きいときは、一番大きい縮小版（実際の幅で書いたもの）で終わりにする
  const isLargerThanAll =
    options.large === true && maxWidth > allWidths[allWidths.length - 1]
  if (Number.isFinite(maxWidth) && !isLargerThanAll) {
    entries.push(`${toUrl(maxWidth)} ${Math.round(maxWidth)}w`)
  }
  return entries.length > 0 ? entries.join(", ") : undefined
}
