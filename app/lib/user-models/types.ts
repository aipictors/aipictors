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
  /**
   * URL（Civitai）から取り込んだときの元のページ。アップロードしたモデルは null
   */
  sourceUrl?: string | null
  /**
   * 元のモデルの作者名
   */
  sourceCreator?: string | null
  sourceLicense?: UserModelSourceLicense | null
  /**
   * 作者のライセンスで他サービス（画像生成サービス）での利用が許可されているか。不明なら null
   */
  sourceLicenseAllowsOtherServices?: boolean | null
  /**
   * 元のサイトでの系統名（Flux, Anima など。baseModel が OTHER のときの説明に使う）
   */
  sourceBaseModel?: string | null
  /**
   * URL からの取り込みの状態（QUEUED / RUNNING / DONE / FAILED）。アップロードしたモデルは null
   */
  importStatus?: string | null
}

export type UserModelSourceLicense = {
  /**
   * Civitai の allowCommercialUse（Image / RentCivit / Rent / Sell）
   */
  allowCommercialUse: string[]
  allowDerivatives: boolean | null
  allowNoCredit: boolean | null
  allowDifferentLicense: boolean | null
}

/**
 * URL から取り込む前の確認内容（aipictors-api の /imports/preview）
 */
export type UserModelImportPreview = {
  source: "civitai"
  sourceUrl: string
  civitaiModelId: number
  civitaiVersionId: number
  kind: UserModelKind
  name: string
  versionName: string | null
  description: string
  creator: string | null
  creatorUrl: string | null
  baseModel: UserModelBaseModel
  sourceBaseModel: string | null
  baseModelSupported: boolean
  triggerWords: string
  tags: string[]
  rating: UserModelRating
  nsfw: boolean
  thumbnailUrl: string | null
  sampleImageUrls: string[]
  filename: string
  sizeBytes: number
  sha256: string
  license: UserModelSourceLicense
  licenseAllowsOtherServices: boolean | null
  maxBytes: number
  tooLarge: boolean
  /**
   * 同じファイルがすでに保存されている（転送なしですぐ使える）
   */
  alreadyStored: boolean
}

export type UserModelImportState =
  | "QUEUED"
  | "TRANSFERRING"
  | "READY"
  | "FAILED"

export type UserModelImportStatus = {
  modelId: string
  status: UserModelImportState
  modelStatus: UserModelStatus
  partsDone: number
  partsTotal: number | null
  sizeBytes: number
  error: string | null
  model: UserModel | null
}

export type StartUserModelImportResult = UserModelImportStatus & {
  deduplicated: boolean
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
