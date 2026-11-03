import { describe, expect, test } from "bun:test"
import type { HistoryState, Layer } from "~/routes/($lang)._main.stickers._index/types/sticker-layer"
import {
  pushStickerHistory,
  redoStickerHistory,
  undoStickerHistory,
} from "~/routes/($lang)._main.stickers._index/utils/sticker-history"

const layersOf = (...names: string[]) =>
  names.map((name) => ({ id: name })) as Layer[]

const empty: HistoryState = { past: [], present: [], future: [] }

describe("スタンプの履歴", () => {
  test("積むと今の状態が過去に入り、やり直しは消える", () => {
    const next = layersOf("a")
    const state = pushStickerHistory(
      { ...empty, future: [layersOf("x")] },
      next,
    )
    expect(state.past).toEqual([[]])
    expect(state.present).toBe(next)
    expect(state.future).toEqual([])
  })

  test("元に戻すとやり直せる", () => {
    const a = layersOf("a")
    const b = layersOf("b")
    const undone = undoStickerHistory({ past: [a], present: b, future: [] })
    expect(undone).toEqual({ past: [], present: a, future: [b] })
    expect(redoStickerHistory(undone)).toEqual({
      past: [a],
      present: b,
      future: [],
    })
  })

  test("戻す先がなければ同じ参照を返す（再描画しない）", () => {
    expect(undoStickerHistory(empty)).toBe(empty)
    expect(redoStickerHistory(empty)).toBe(empty)
  })
})
