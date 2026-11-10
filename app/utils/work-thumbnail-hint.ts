/**
 * 一覧で押した作品のサムネイルを覚えておき、作品ページの大きい画像が届くまで代わりに出す。
 * 大きい画像は初めて開くときに縮小版を作るので 1 秒以上かかることがあるが、
 * サムネイルは一覧で読み終えているのですぐ出せる
 */

const WORK_PATH = /\/posts\/(\d+)(?:[/?#]|$)/

/** 比率がこれ以上違うサムネイル（正方形に切り抜いたものなど）は使わない */
const MAX_ASPECT_RATIO_DIFFERENCE = 0.05

type Hint = { workId: string; url: string; aspectRatio: number }

let lastHint: Hint | null = null

const rememberFromEvent = (event: Event) => {
  const target = event.target
  if (!(target instanceof Element)) return
  const link = target.closest<HTMLAnchorElement>("a[href*='/posts/']")
  const image = link?.querySelector("img")
  const workId = link?.getAttribute("href")?.match(WORK_PATH)?.[1]
  if (!image?.currentSrc || !image.naturalHeight || !workId) return
  lastHint = {
    workId,
    url: image.currentSrc,
    aspectRatio: image.naturalWidth / image.naturalHeight,
  }
}

export const installWorkThumbnailHints = () => {
  const options = { capture: true, passive: true }
  document.addEventListener("pointerdown", rememberFromEvent, options)
  return () =>
    document.removeEventListener("pointerdown", rememberFromEvent, options)
}

export const getWorkThumbnailHint = (
  workId: string,
  aspectRatio: number | undefined,
): string | undefined => {
  if (lastHint?.workId !== workId || !aspectRatio) return undefined
  const difference = Math.abs(lastHint.aspectRatio - aspectRatio) / aspectRatio
  return difference <= MAX_ASPECT_RATIO_DIFFERENCE ? lastHint.url : undefined
}
