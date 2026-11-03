import type { HistoryState, Layer } from "~/routes/($lang)._main.stickers._index/types/sticker-layer"

/**
 * 新しい状態を積む（やり直しの分は消える）
 */
export const pushStickerHistory = (
  prev: HistoryState,
  next: Layer[],
): HistoryState => ({
  past: [...prev.past, prev.present],
  present: next,
  future: [],
})

export const undoStickerHistory = (prev: HistoryState): HistoryState => {
  if (prev.past.length === 0) return prev
  const previous = prev.past[prev.past.length - 1]
  const newPast = prev.past.slice(0, -1)
  return {
    past: newPast,
    present: previous,
    future: [prev.present, ...prev.future],
  }
}

export const redoStickerHistory = (prev: HistoryState): HistoryState => {
  if (prev.future.length === 0) return prev
  const next = prev.future[0]
  const newFuture = prev.future.slice(1)
  return {
    past: [...prev.past, prev.present],
    present: next,
    future: newFuture,
  }
}
