import type { TSortableItem } from "~/components/drag/sortable-item"

/**
 * 投稿の直前に「自動でかけたモザイク」を確かめてもらう画像（かけた後の画像）
 * - 自動でかけたままの画像だけ。手で直した・外した画像は本人が見ているので出さない
 * - 範囲が空（全部外した）・元の画像のままの画像も出さない
 */
export const getAutoMosaicConfirmPreviews = (items: TSortableItem[]) =>
  items.flatMap((item) =>
    item.mosaic?.isAuto === true &&
    Boolean(item.mosaic.mask) &&
    item.content !== null &&
    item.content !== item.mosaic.source
      ? [item.content]
      : [],
  )

/** タグ・プロンプトに触手がある（自動モザイクで触手を性器と見間違えないようにする） */
export const isTentaclePost = (props: {
  tags: { text: string }[]
  prompt?: string | null
}) =>
  props.tags.some((tag) => /触手|tentacle/i.test(tag.text)) ||
  /触手|tentacle/i.test(props.prompt ?? "")
