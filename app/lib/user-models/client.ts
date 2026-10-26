import { getAuth, getIdToken } from "firebase/auth"
import type {
  MyUserModelsResult,
  ReportUserModelResult,
  StartUploadInput,
  StartUploadResult,
  StartUserModelImportResult,
  UploadedPart,
  UserModel,
  UserModelEditableFields,
  UserModelImportPreview,
  UserModelImportStatus,
  UserModelListParams,
  UserModelListResult,
  UserModelModerationAction,
  UserModelRating,
  UserModelReportReason,
  UserModelReportsResult,
} from "~/lib/user-models/types"

export class UserModelsApiError extends Error {
  readonly status: number
  readonly code: string | null

  constructor(message: string, status: number, code: string | null) {
    super(message)
    this.name = "UserModelsApiError"
    this.status = status
    this.code = code
  }

  get isLimitExceeded(): boolean {
    return this.code === "LIMIT_EXCEEDED" || this.status === 403
  }
}

/**
 * ログイン中なら Firebase ID トークン付きのヘッダー
 */
export const getUserModelsAuthHeaders = async (
  required: boolean,
): Promise<Record<string, string>> => {
  const currentUser = (() => {
    try {
      return getAuth().currentUser
    } catch {
      return null
    }
  })()

  if (!currentUser) {
    if (required) {
      throw new UserModelsApiError("ログインが必要です", 401, null)
    }
    return {}
  }

  const idToken = await getIdToken(currentUser)
  return { authorization: `Bearer ${idToken}` }
}

type ApiEnvelope<T> = {
  error: string | null
  code?: string | null
  data: T | null
}

export const parseUserModelsResponse = async <T>(
  response: Response,
): Promise<T> => {
  const text = await response.text()
  const json = (() => {
    if (!text) return null
    try {
      return JSON.parse(text) as ApiEnvelope<T>
    } catch {
      return null
    }
  })()

  if (!response.ok || json === null || json.error) {
    const message =
      json?.error ??
      (response.status === 401
        ? "ログインが必要です"
        : `通信に失敗しました（${response.status}）`)
    throw new UserModelsApiError(message, response.status, json?.code ?? null)
  }

  return json.data as T
}

const request = async <T>(
  path: string,
  init: RequestInit & { auth: "required" | "optional" },
): Promise<T> => {
  const authHeaders = await getUserModelsAuthHeaders(init.auth === "required")
  const headers: Record<string, string> = {
    ...authHeaders,
    ...((init.headers as Record<string, string> | undefined) ?? {}),
  }
  if (init.body && typeof init.body === "string") {
    headers["content-type"] = "application/json"
  }
  const response = await fetch(path, { ...init, headers })
  return parseUserModelsResponse<T>(response)
}

/**
 * 一覧の正規化（API の古い形にも耐える）
 */
export const normalizeUserModel = (model: UserModel): UserModel => {
  const tags = Array.isArray(model.tags)
    ? model.tags
    : typeof model.tags === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(model.tags) as unknown
            return Array.isArray(parsed) ? parsed.map(String) : []
          } catch {
            return []
          }
        })()
      : []
  const sampleImageUrls = Array.isArray(model.sampleImageUrls)
    ? model.sampleImageUrls
    : typeof model.sampleImageUrls === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(model.sampleImageUrls) as unknown
            return Array.isArray(parsed) ? parsed.map(String) : []
          } catch {
            return []
          }
        })()
      : []
  return {
    ...model,
    description: model.description ?? "",
    triggerWords: model.triggerWords ?? "",
    recommendedWeight:
      typeof model.recommendedWeight === "number"
        ? model.recommendedWeight
        : 0.8,
    tags,
    sampleImageUrls,
    useCount: Number(model.useCount ?? 0),
    sizeBytes: Number(model.sizeBytes ?? 0),
  }
}

export const fetchUserModels = async (
  params: UserModelListParams,
): Promise<UserModelListResult> => {
  const search = new URLSearchParams()
  if (params.kind) search.set("kind", params.kind)
  if (params.q) search.set("q", params.q)
  if (params.baseModel) search.set("baseModel", params.baseModel)
  if (params.sort) search.set("sort", params.sort)
  if (params.ratings && params.ratings.length > 0) {
    search.set("ratings", params.ratings.join(","))
  }
  search.set("offset", String(params.offset ?? 0))
  search.set("limit", String(params.limit ?? 24))

  const data = await request<UserModelListResult>(
    `/api/user-models?${search.toString()}`,
    { method: "GET", auth: "optional" },
  )
  const models = (data?.models ?? []).map(normalizeUserModel)
  return {
    models,
    hasMore:
      typeof data?.hasMore === "boolean"
        ? data.hasMore
        : models.length >= (params.limit ?? 24),
  }
}

export const fetchUserModel = async (id: string): Promise<UserModel> => {
  const data = await request<UserModel>(
    `/api/user-models/${encodeURIComponent(id)}`,
    { method: "GET", auth: "optional" },
  )
  return normalizeUserModel(data)
}

export const fetchMyUserModels = async (): Promise<MyUserModelsResult> => {
  const data = await request<MyUserModelsResult>("/api/user-models/mine", {
    method: "GET",
    auth: "required",
  })
  return {
    models: (data?.models ?? []).map(normalizeUserModel),
    limit: Number(data?.limit ?? 0),
    used: Number(data?.used ?? 0),
    planType: data?.planType ?? null,
  }
}

export const updateUserModel = async (
  id: string,
  fields: Partial<UserModelEditableFields>,
): Promise<UserModel> => {
  const data = await request<UserModel>(
    `/api/user-models/${encodeURIComponent(id)}`,
    { method: "PATCH", auth: "required", body: JSON.stringify(fields) },
  )
  return normalizeUserModel(data)
}

export const deleteUserModel = async (id: string): Promise<void> => {
  await request<{ id: string }>(`/api/user-models/${encodeURIComponent(id)}`, {
    method: "DELETE",
    auth: "required",
  })
}

export const startUserModelUpload = async (
  input: StartUploadInput,
): Promise<StartUploadResult> => {
  return request<StartUploadResult>("/api/user-models/uploads", {
    method: "POST",
    auth: "required",
    body: JSON.stringify(input),
  })
}

export const completeUserModelUpload = async (
  modelId: string,
  parts: UploadedPart[],
): Promise<UserModel> => {
  const data = await request<UserModel>(
    `/api/user-models/uploads/${encodeURIComponent(modelId)}/complete`,
    {
      method: "POST",
      auth: "required",
      body: JSON.stringify({
        parts: [...parts].sort((a, b) => a.partNumber - b.partNumber),
      }),
    },
  )
  return normalizeUserModel(data)
}

export const abortUserModelUpload = async (modelId: string): Promise<void> => {
  await request<{ id: string }>(
    `/api/user-models/uploads/${encodeURIComponent(modelId)}/abort`,
    { method: "POST", auth: "required", body: JSON.stringify({}) },
  )
}

/**
 * URL（Civitai）のモデルの内容を確認する（まだ登録しない）
 */
export const previewUserModelImport = async (
  url: string,
): Promise<UserModelImportPreview> => {
  return request<UserModelImportPreview>("/api/user-models/imports/preview", {
    method: "POST",
    auth: "required",
    body: JSON.stringify({ url }),
  })
}

/**
 * URL からの取り込みを始める（転送はサーバー側で続くのでページを閉じてもよい）
 */
export const startUserModelImport = async (input: {
  url: string
  name?: string
  rating?: UserModelRating
}): Promise<StartUserModelImportResult> => {
  const data = await request<StartUserModelImportResult>(
    "/api/user-models/imports",
    { method: "POST", auth: "required", body: JSON.stringify(input) },
  )
  return { ...data, model: data.model ? normalizeUserModel(data.model) : null }
}

export const fetchUserModelImportStatus = async (
  modelId: string,
): Promise<UserModelImportStatus> => {
  const data = await request<UserModelImportStatus>(
    `/api/user-models/imports/${encodeURIComponent(modelId)}`,
    { method: "GET", auth: "required" },
  )
  return { ...data, model: data.model ? normalizeUserModel(data.model) : null }
}

export const cancelUserModelImport = async (modelId: string): Promise<void> => {
  await request<{ modelId: string }>(
    `/api/user-models/imports/${encodeURIComponent(modelId)}/cancel`,
    { method: "POST", auth: "required", body: JSON.stringify({}) },
  )
}

export const reportUserModel = async (
  id: string,
  input: { reason: UserModelReportReason; detail?: string },
): Promise<ReportUserModelResult> => {
  return request<ReportUserModelResult>(
    `/api/user-models/${encodeURIComponent(id)}/report`,
    { method: "POST", auth: "required", body: JSON.stringify(input) },
  )
}

/**
 * 通報されたモデルの一覧（モデレーターのみ）
 */
export const fetchUserModelReports = async (params: {
  offset?: number
  limit?: number
}): Promise<UserModelReportsResult> => {
  const search = new URLSearchParams()
  search.set("offset", String(params.offset ?? 0))
  search.set("limit", String(params.limit ?? 50))
  const data = await request<UserModelReportsResult>(
    `/api/admin/user-models?${search.toString()}`,
    { method: "GET", auth: "required" },
  )
  return {
    reports: (data?.reports ?? []).map((report) => ({
      ...report,
      model: normalizeUserModel(report.model),
      reportCount: Number(report.reportCount ?? 0),
      reasons: Array.isArray(report.reasons) ? report.reasons : [],
    })),
  }
}

/**
 * モデルの非公開・公開戻し（モデレーターのみ）
 */
export const moderateUserModel = async (input: {
  modelId: string
  action: UserModelModerationAction
  reason?: string
}): Promise<UserModel> => {
  const data = await request<UserModel>("/api/admin/user-models", {
    method: "POST",
    auth: "required",
    body: JSON.stringify(input),
  })
  return normalizeUserModel(data)
}

/**
 * パートを送信する（XHR で送信バイト数の進捗を取る）
 */
export const uploadUserModelPart = (props: {
  modelId: string
  partNumber: number
  blob: Blob
  authorization: string
  onProgress(loadedBytes: number): void
  signal: AbortSignal
}): Promise<UploadedPart> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(
      "PUT",
      `/api/user-models/uploads/${encodeURIComponent(props.modelId)}/parts/${props.partNumber}`,
    )
    xhr.setRequestHeader("authorization", props.authorization)
    xhr.setRequestHeader("content-type", "application/octet-stream")
    xhr.upload.onprogress = (event) => {
      props.onProgress(event.loaded)
    }
    xhr.onload = () => {
      const json = (() => {
        try {
          return JSON.parse(xhr.responseText) as ApiEnvelope<UploadedPart>
        } catch {
          return null
        }
      })()
      if (xhr.status >= 200 && xhr.status < 300 && json?.data?.etag) {
        resolve({ partNumber: props.partNumber, etag: json.data.etag })
        return
      }
      reject(
        new UserModelsApiError(
          json?.error ?? `パートの送信に失敗しました（${xhr.status}）`,
          xhr.status,
          json?.code ?? null,
        ),
      )
    }
    xhr.onerror = () => {
      reject(
        new UserModelsApiError("ネットワークエラーが発生しました", 0, null),
      )
    }
    xhr.onabort = () => {
      reject(new DOMException("Aborted", "AbortError"))
    }
    if (props.signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"))
      return
    }
    props.signal.addEventListener("abort", () => xhr.abort(), { once: true })
    xhr.send(props.blob)
  })
}
