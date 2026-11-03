export const PAGE_SIZE = 12

export const RATING_OPTIONS = [
  { value: "ALL", label: "全年齢区分すべて" },
  { value: "G", label: "全年齢" },
  { value: "R15", label: "R-15" },
  { value: "R18", label: "R-18" },
  { value: "R18G", label: "R-18G" },
] as const

export type WorkItem = {
  id: string
  title: string
  description: string | null
  type: "WORK" | "VIDEO" | "NOVEL" | "COLUMN" | string
  accessType: string
  adminAccessType: "PUBLIC" | "PRIVATE" | "TEMPORARY_PRIVATE" | string
  isDeleted: boolean
  createdAt: number
  likesCount: number
  commentsCount: number
  subWorksCount: number
  imageURL: string | null
  isCommentsEditable: boolean
  isLiked: boolean
  isSensitive: boolean
  smallThumbnailImageURL: string | null
  subWorks: Array<{
    id: string
    imageUrl: string | null
  }>
  user: {
    id: string
    name: string
    login: string
    iconUrl: string | null
    isBlocked: boolean
  } | null
}

export const toAccessTypeText = (accessType: string) => {
  switch (accessType) {
    case "PUBLIC":
      return "公開"
    case "PRIVATE":
      return "非公開"
    case "DRAFT":
      return "下書き"
    case "LIMITED":
      return "限定公開"
    case "SILENT":
      return "サイレント"
    default:
      return accessType
  }
}

export const toAdminAccessTypeText = (
  accessType: WorkItem["adminAccessType"],
) => {
  switch (accessType) {
    case "PUBLIC":
      return "運営公開"
    case "PRIVATE":
      return "運営非公開"
    case "TEMPORARY_PRIVATE":
      return "一時非公開"
    default:
      return accessType
  }
}

export const toWorkTypeText = (type: WorkItem["type"]) => {
  switch (type) {
    case "WORK":
      return "イラスト"
    case "VIDEO":
      return "動画"
    case "NOVEL":
      return "小説"
    case "COLUMN":
      return "コラム"
    default:
      return type
  }
}

export const getJstDateString = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  return formatter.format(date)
}

export const getJstDateRange = (dateString: string) => {
  if (!dateString) {
    return null
  }

  return {
    createdAtAfter: new Date(`${dateString}T00:00:00+09:00`).toISOString(),
    beforeCreatedAt: new Date(`${dateString}T23:59:59.999+09:00`).toISOString(),
  }
}

export const parseWorkIds = (value: string) => {
  return value
    .split(/[\s,、]+/)
    .map((item) => Number.parseInt(item.trim(), 10))
    .filter((item) => Number.isFinite(item) && item > 0)
    .map((item) => String(item))
}

/**
 * 絞り込みの入力から works の条件を作る
 */
export const buildAdminWorksWhere = (props: {
  dateFilter: string
  ownerFilter: string
  ratingFilter: string
  titleFilter: string
  workIdFilter: string
}) => {
  const { dateFilter, ownerFilter, ratingFilter, titleFilter, workIdFilter } =
    props
  const where: Record<string, unknown> = {
    isIncludePrivate: true,
    ratings: ["G", "R15", "R18", "R18G"],
  }

  const ids = parseWorkIds(workIdFilter)
  if (ids.length > 0) {
    where.ids = ids
  }

  if (titleFilter.trim().length > 0) {
    where.search = titleFilter.trim()
  }

  if (ownerFilter.trim().length > 0) {
    where.ownerName = ownerFilter.trim()
  }

  if (ratingFilter !== "ALL") {
    where.ratings = [ratingFilter]
  }

  const dateRange = getJstDateRange(dateFilter)
  if (dateRange) {
    where.createdAtAfter = dateRange.createdAtAfter
    where.beforeCreatedAt = dateRange.beforeCreatedAt
  }

  return where
}
