/** 拡大表示の状態（拡大率と、枠の真ん中からのずれ px） */
export type ZoomView = { scale: number; x: number; y: number }

export const INITIAL_ZOOM_VIEW: ZoomView = { scale: 1, x: 0, y: 0 }

export const MIN_ZOOM_SCALE = 1

export const MAX_ZOOM_SCALE = 8

type Size = { width: number; height: number }

type Point = { x: number; y: number }

/**
 * 画像の端が枠の内側まで入りこまないようにずれを抑える。等倍以下は真ん中に戻す
 * @param image 拡大前の画像の大きさ
 * @param frame 枠の大きさ
 */
export function clampZoomView(
  view: ZoomView,
  image: Size,
  frame: Size,
): ZoomView {
  if (view.scale <= MIN_ZOOM_SCALE) return INITIAL_ZOOM_VIEW
  const scale = Math.min(view.scale, MAX_ZOOM_SCALE)
  const maxX = Math.max(0, (image.width * scale - frame.width) / 2)
  const maxY = Math.max(0, (image.height * scale - frame.height) / 2)
  return {
    scale,
    x: Math.min(Math.max(view.x, -maxX), maxX),
    y: Math.min(Math.max(view.y, -maxY), maxY),
  }
}

/**
 * point（枠の真ん中を原点にした位置）の下にある画像の点を動かさずに、拡大率を scale にする
 */
export function zoomViewAt(
  view: ZoomView,
  scale: number,
  point: Point,
): ZoomView {
  const ratio = scale / view.scale
  return {
    scale,
    x: point.x - (point.x - view.x) * ratio,
    y: point.y - (point.y - view.y) * ratio,
  }
}

/** 等倍のときの横のスワイプ。-1: 前へ、1: 次へ、0: 切り替えない */
export function toSwipeDirection(deltaX: number, deltaY: number) {
  if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) {
    return 0
  }
  return deltaX < 0 ? 1 : -1
}
