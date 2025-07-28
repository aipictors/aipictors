export type Tag = {
  id: string
  name: string
  nameJa?: string | null
  nameEn?: string | null
  worksCount?: number | null
  isSensitive?: boolean | null
  isRecommended?: boolean | null
}

export type RecommendedTag = {
  tagName: string
  thumbnailUrl: string | null
}
