export type UserModelKind = "LORA" | "CHECKPOINT"

export type UserModelBaseModel =
  | "SD1.5"
  | "SDXL"
  | "PONY"
  | "ILLUSTRIOUS"
  | "NOOBAI"
  | "OTHER"

export type UserModelRating = "G" | "R15" | "R18" | "R18G"

export type UserModelStatus = "UPLOADING" | "READY" | "DISABLED" | "DELETED"

export type UserModelAuthor = {
  id: string
  login: string
  name: string
  iconUrl: string | null
}

export type UserModel = {
  id: string
  userId: string
  kind: UserModelKind
  name: string
  description: string
  baseModel: UserModelBaseModel
  /**
   * カンマ区切り
   */
  triggerWords: string
  recommendedWeight: number
  rating: UserModelRating
  tags: string[]
  thumbnailUrl: string | null
  sampleImageUrls: string[]
  sha256: string
  sizeBytes: number
  status: UserModelStatus
  useCount: number
  lastUsedAt: number | null
  createdAt: number
  updatedAt: number
  user?: UserModelAuthor | null
}

export type UserModelSort = "popular" | "new"

export type UserModelListParams = {
  kind?: UserModelKind | null
  q?: string
  baseModel?: UserModelBaseModel | null
  sort?: UserModelSort
  ratings?: UserModelRating[]
  offset?: number
  limit?: number
}

export type UserModelListResult = {
  models: UserModel[]
  hasMore: boolean
}

export type MyUserModelsResult = {
  models: UserModel[]
  limit: number
  used: number
  planType: "FREE" | "LITE" | "STANDARD" | "PREMIUM" | null
}

export type UserModelEditableFields = {
  name: string
  description: string
  triggerWords: string
  recommendedWeight: number
  baseModel: UserModelBaseModel
  rating: UserModelRating
  tags: string[]
  thumbnailUrl: string | null
  sampleImageUrls: string[]
}

export type StartUploadInput = UserModelEditableFields & {
  kind: UserModelKind
  filename: string
  sizeBytes: number
  sha256: string
}

export type UploadedPart = {
  partNumber: number
  etag: string
}

export type StartUploadResult = {
  modelId: string
  uploadId: string | null
  partSize: number
  deduplicated: boolean
  uploadedParts?: UploadedPart[]
}

export type UserModelReportReason =
  | "COPYRIGHT"
  | "REAL_PERSON"
  | "ILLEGAL"
  | "WRONG_RATING"
  | "BROKEN"
  | "SPAM"
  | "OTHER"

export type ReportUserModelResult = {
  id: string
  reported: boolean
  openReports: number
  autoHidden: boolean
}

export type UserModelReportSummary = {
  model: UserModel
  status: UserModelStatus
  disabledReason: string | null
  reportCount: number
  reasons: UserModelReportReason[]
  /**
   * unix 秒
   */
  lastReportedAt: number | null
}

export type UserModelReportsResult = {
  reports: UserModelReportSummary[]
}

export type UserModelModerationAction = "disable" | "enable"
