/**
 * 全員が使える既定のスタンプの id（新しいぴくたーちゃんの 5 個と、以前の 5 個）。
 * サーバーの lib/default-stickers.ts と同じ
 */
const DEFAULT_STICKER_IDS = new Set([
  "88355",
  "88356",
  "88357",
  "88358",
  "88359",
  "0",
  "1",
  "2",
  "3",
  "4",
])

export const isDefaultStickerId = (id: string) => DEFAULT_STICKER_IDS.has(id)

/**
 * 保存したスタンプを先に、既定のスタンプを後ろに並べ替える（それぞれの順番はそのまま）。
 * サーバーは保存日の一覧の先頭に既定のスタンプを付けて返すので、スマホでは最初の画面が既定のスタンプで埋まり、
 * 自分のスタンプがスクロールしないと見えなかった
 */
export const moveDefaultStickersToEnd = <T extends { id: string }>(
  stickers: readonly T[],
): T[] => [
  ...stickers.filter((sticker) => !isDefaultStickerId(sticker.id)),
  ...stickers.filter((sticker) => isDefaultStickerId(sticker.id)),
]
