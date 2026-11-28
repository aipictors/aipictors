export type UserModelKind = "LORA" | "CHECKPOINT"

export type UserModelBaseModel =
  | "SD1.5"
  | "SDXL"
  | "PONY"
  | "ILLUSTRIOUS"
  | "NOOBAI"
  | "MOSS"
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
  /** ヘッダーを除いた本体の sha256（A1111 の Lora hashes）。ピックアップの LoRA だけ入る */
  addnetHash?: string | null
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
  /**
   * 登録者が勧める生成設定（未設定は null）
   */
  recommendedSettings?: UserModelRecommendedSettings | null
  /**
   * 登録者が作者か（true = 自分で作った / false = 他の人のモデル。未申告・Civitai から自動で出典を入れたものは null）
   */
  isOriginal?: boolean | null
  /**
   * 出典を登録者が直せるか（Civitai から自動で入れた出典は直せない）
   */
  sourceEditable?: boolean
}

export type UserModelRecommendedSettings = {
  sampler: string | null
  /**
   * Schedule type
   */
  scheduler: string | null
  cfgScale: number | null
  steps: number | null
  clipSkip: number | null
  /**
   * プロンプトの先頭に足す品質タグ
   */
  qualityPrompt?: string | null
  negativePrompt?: string | null
  /**
   * 自動で入れたもの（登録者が入れたものにはない）。civitai=作例から / base-model=ベースモデルの定番
   */
  source?: "civitai" | "base-model"
  /**
   * source=civitai のとき、集計した作例の数
   */
  sampleCount?: number
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
  /** 条件に合う件数（古い API では返らないので null） */
  totalCount: number | null
}

export type MyUserModelsResult = {
  models: UserModel[]
  /** 個数の上限はないので null（以前の API では 1 か月に登録できる数） */
  limit: number | null
  /** 1 か月（JST）に登録できる合計サイズ（バイト） */
  limitBytes?: number
  /** 今月登録したファイルの合計サイズ（バイト） */
  usedBytesThisMonth?: number
  /** 今月あと登録できるサイズ（バイト） */
  remainingBytes?: number
  /** 持っているモデルの数 */
  used: number
  /** 今月登録した数 */
  usedThisMonth?: number
  /** 枠が戻る日時（次の月の 1 日 00:00 JST、UNIX 秒） */
  resetsAt?: number
  /** 登録したモデルを作者が削除できるか（いまは常に false） */
  canDelete?: boolean
  planType: "FREE" | "LITE" | "STANDARD" | "PREMIUM" | null
}

/** 上限と比べる量（今月登録したファイルの合計サイズ、バイト） */
export const monthlyUsedOf = (
  data: Pick<MyUserModelsResult, "usedBytesThisMonth">,
) => data.usedBytesThisMonth ?? 0

/** 今月登録できる合計サイズ（バイト）。古い API で無いときは 0（上限なし扱い） */
export const monthlyLimitOf = (data: Pick<MyUserModelsResult, "limitBytes">) =>
  data.limitBytes ?? 0

/** 枠の表示（例: 10GB、2.35GB、350MB） */
export const formatModelQuotaBytes = (bytes: number) => {
  const gb = bytes / 1024 ** 3
  if (gb >= 1 || bytes === 0) return `${Number(gb.toFixed(2))}GB`
  return `${Math.max(1, Math.round(bytes / 1024 ** 2))}MB`
}

/** 枠が戻る日の表示（例: 12/1） */
export const formatModelQuotaReset = (resetsAt: number | undefined) => {
  if (!resetsAt) return "毎月1日"
  const d = new Date((resetsAt + 9 * 3600) * 1000)
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`
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
  /**
   * おすすめの生成設定（チェックポイントのみ入力）。null で消す
   */
  recommendedSettings?: UserModelRecommendedSettings | null
  /**
   * 登録者が作者か（true = 自分で作った / false = 他の人のモデル。未申告は null）
   */
  isOriginal?: boolean | null
  /**
   * 他の人のモデルの元のページと作者名（isOriginal が false のとき）
   */
  sourceUrl?: string | null
  sourceCreator?: string | null
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

/**
 * 週替わりのピックアップモデル（今週の分。月曜 00:00 JST 始まり）
 */
export type UserModelPickup = {
  weekStart: string
  weekEnd: string
  modelId: string
  source: "AUTO" | "ADMIN" | string
  eventSlug: string | null
  /** その週のお題のタグ（このタグの作品がランキングに入る） */
  eventTag: string
  /** 登録者の表示名 */
  authorName: string | null
  model: UserModel
}

export type UserModelPickupCandidate = {
  modelId: string
  name: string
  userId: string
  score: number
  stats: {
    generations: number
    users: number
    kind: string
    uploaded: boolean
    ageDays: number
    samples: number
    useCount: number
  }
  excludedReason: string | null
}

export type UserModelPickupAdminEntry = Omit<
  UserModelPickup,
  "authorName" | "model"
> & {
  score: number | null
  stats: Record<string, unknown>
  xDraft: { text: string; images: string[] } | null
  decidedBy: string | null
  model: UserModel | null
}

export type UserModelPickupAdmin = {
  weekStart: string
  currentWeekStart: string
  pickups: UserModelPickupAdminEntry[]
  candidates: UserModelPickupCandidate[]
}
