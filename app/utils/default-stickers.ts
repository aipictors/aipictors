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
