export const COLLECTION_WORKS_PER_PAGE = 16

/** これより後ろのページは最初のページとして扱う */
const COLLECTION_MAX_PAGE = 100

/**
 * URL の ?page=（0 始まり。以前からのリンクに合わせる）をページ番号にする
 */
export const toCollectionPageIndex = (value: string | null) => {
  if (value === null) {
    return 0
  }

  const page = Number.parseInt(value, 10)

  if (!Number.isInteger(page) || page < 0 || page >= COLLECTION_MAX_PAGE) {
    return 0
  }

  return page
}

/**
 * 空の文字列や重複を除いたタグ（自動で作られたコレクションは [""] を持っている）
 */
export const toCollectionTags = (tags: readonly string[] | null | undefined) => {
  const values = (tags ?? []).map((tag) => tag.trim()).filter(Boolean)
  return Array.from(new Set(values))
}

type CollectionForCover = {
  thumbnailImageURL?: string | null
  isSensitive?: boolean | null
  rating?: string | null
  firstWorks: {
    rating?: string | null
    largeThumbnailImageURL?: string | null
  }[]
}

export const isAdultCollection = (collection: {
  isSensitive?: boolean | null
  rating?: string | null
}) => {
  return (
    collection.isSensitive === true ||
    collection.rating === "R18" ||
    collection.rating === "R18G"
  )
}

/**
 * 表紙。未設定なら 1 作目の画像を使う（全年齢のコレクションでは R18 の作品を表紙にしない）
 */
export const toCollectionCoverUrl = (collection: CollectionForCover) => {
  if (collection.thumbnailImageURL) {
    return collection.thumbnailImageURL
  }

  const firstWork = collection.firstWorks[0]

  if (!firstWork?.largeThumbnailImageURL) {
    return null
  }

  const isAdultWork = firstWork.rating === "R18" || firstWork.rating === "R18G"

  if (isAdultWork && !isAdultCollection(collection)) {
    return null
  }

  return firstWork.largeThumbnailImageURL
}

type CollectionForMeta = {
  title: string
  description: string
  worksCount?: number | null
  user?: { name: string } | null
}

/**
 * meta の題名と説明
 */
export const toCollectionMetaText = (
  collection: CollectionForMeta,
  page: number,
) => {
  const title = collection.title.trim() || "無題"
  const enTitle = collection.title.trim() || "Untitled"
  const userName = collection.user?.name ?? ""
  const worksCount = collection.worksCount ?? 0
  const pageSuffix = page > 0 ? `（${page + 1}ページ目）` : ""
  const enPageSuffix = page > 0 ? ` (page ${page + 1})` : ""
  const description = collection.description.trim()

  return {
    title: `${title} - ${userName}さんのコレクション${pageSuffix}`,
    enTitle: `${enTitle} - Collection by ${userName}${enPageSuffix}`,
    description:
      description.length > 0
        ? description.slice(0, 120)
        : `${userName}さんがまとめた${worksCount}作品のコレクション「${title}」`,
    enDescription:
      description.length > 0
        ? description.slice(0, 120)
        : `A collection of ${worksCount} works by ${userName}: "${enTitle}"`,
  }
}
