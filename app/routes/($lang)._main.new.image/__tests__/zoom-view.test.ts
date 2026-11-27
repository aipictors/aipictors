import { describe, expect, test } from "bun:test"
import {
  clampZoomView,
  INITIAL_ZOOM_VIEW,
  MAX_ZOOM_SCALE,
  toSwipeDirection,
  zoomViewAt,
} from "~/routes/($lang)._main.new.image/utils/zoom-view"

const image = { width: 400, height: 300 }
const frame = { width: 400, height: 600 }

describe("clampZoomView", () => {
  test("等倍以下は真ん中に戻す", () => {
    expect(clampZoomView({ scale: 0.7, x: 50, y: 20 }, image, frame)).toEqual(
      INITIAL_ZOOM_VIEW,
    )
  })

  test("画像の端より外へは動かさない", () => {
    // 2 倍で 800x600。横は (800-400)/2=200 まで、縦は枠に収まるので動かさない
    expect(clampZoomView({ scale: 2, x: 500, y: 100 }, image, frame)).toEqual({
      scale: 2,
      x: 200,
      y: 0,
    })
  })

  test("拡大率の上限を超えない", () => {
    expect(clampZoomView({ scale: 100, x: 0, y: 0 }, image, frame).scale).toBe(
      MAX_ZOOM_SCALE,
    )
  })
})

describe("zoomViewAt", () => {
  test("指した所の下の点が動かない", () => {
    const point = { x: 100, y: -50 }
    const view = { scale: 1.5, x: 20, y: 10 }
    const next = zoomViewAt(view, 3, point)
    // 画像上の点（枠の真ん中からの位置を拡大前に戻したもの）が同じ
    const before = {
      x: (point.x - view.x) / view.scale,
      y: (point.y - view.y) / view.scale,
    }
    const after = {
      x: (point.x - next.x) / next.scale,
      y: (point.y - next.y) / next.scale,
    }
    expect(after.x).toBeCloseTo(before.x)
    expect(after.y).toBeCloseTo(before.y)
  })
})

describe("toSwipeDirection", () => {
  test("左へのスワイプは次、右へは前", () => {
    expect(toSwipeDirection(-120, 10)).toBe(1)
    expect(toSwipeDirection(120, -10)).toBe(-1)
  })

  test("短い・縦向きの動きは切り替えない", () => {
    expect(toSwipeDirection(30, 0)).toBe(0)
    expect(toSwipeDirection(80, 100)).toBe(0)
  })
})
