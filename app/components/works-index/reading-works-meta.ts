import { META, type MetaData } from "~/config"
import type { ReadingKind } from "~/components/works-index/reading-works-config"
import type { ReadingWorksData } from "~/components/works-index/reading-works-loader.server"
import { READING_CONFIGS } from "~/components/works-index/reading-works-config"

const META_KEYS: Record<ReadingKind, string> = {
  novel: "NOVELS",
  column: "NOTES",
}

/**
 * 読みものの一覧のメタ情報
 * - 2 ページ目以降は題名を変える（同じ題名のページを増やさない）
 * - 検索結果と既定でない並び順は、同じ作品の並べ替えなので検索エンジンに載せない
 */
export const toReadingMeta = (
  kind: ReadingKind,
  data: ReadingWorksData | undefined,
): MetaData => {
  const base = META[META_KEYS[kind]] ?? {}
  const page = data?.page ?? 0
  const isDefaultList =
    !data?.q &&
    (data === undefined || data.sort === READING_CONFIGS[kind].defaultSort)

  return {
    ...base,
    title: page > 0 ? `${base.title}（${page + 1}ページ目）` : base.title,
    enTitle: page > 0 ? `${base.enTitle} (Page ${page + 1})` : base.enTitle,
    image: data?.works[0]?.smallThumbnailImageURL || undefined,
    isIndex: isDefaultList,
  }
}
