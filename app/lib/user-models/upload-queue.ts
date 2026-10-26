import { useSyncExternalStore } from "react"
import {
  abortUserModelUpload,
  cancelUserModelImport,
  completeUserModelUpload,
  fetchUserModelImportStatus,
  getUserModelsAuthHeaders,
  startUserModelImport,
  startUserModelUpload,
  UserModelsApiError,
  uploadUserModelPart,
} from "~/lib/user-models/client"
import { USER_MODEL_PART_SIZE } from "~/lib/user-models/constants"
import {
  importPercent,
  importPollDelayMs,
  parseStoredImportJobs,
  type StoredImportJob,
} from "~/lib/user-models/import-utils"
import {
  readResumeCache,
  writeResumeCache,
} from "~/lib/user-models/resume-cache"
import type {
  UploadedPart,
  UserModel,
  UserModelEditableFields,
  UserModelImportState,
  UserModelKind,
  UserModelRating,
} from "~/lib/user-models/types"
import {
  computeFileSha256,
  MultipartUploader,
  type MultipartUploadProgress,
} from "~/lib/user-models/upload-engine"

export type UploadJobStatus =
  | "hashing"
  | "starting"
  | "uploading"
  | "paused"
  | "completing"
  // URL からの取り込み（転送はサーバー側。ページを閉じても続く）
  | "importing"
  | "done"
  | "error"
  | "canceled"

/**
 * 画面に出すアップロードの状態（ファイル本体などは内部に持つ）
 */
export type UploadJob = {
  id: string
  name: string
  fileName: string
  kind: UserModelKind
  sizeBytes: number
  status: UploadJobStatus
  hashedBytes: number
  progress: MultipartUploadProgress | null
  message: string | null
  isLimitExceeded: boolean
  modelId: string | null
  model: UserModel | null
  deduplicated: boolean
  /**
   * file: ブラウザからアップロード / url: URL から取り込み
   */
  source: "file" | "url"
  importProgress: {
    state: UserModelImportState
    partsDone: number
    partsTotal: number | null
  } | null
}

type JobInternal = {
  file: File | null
  importInput?: { url: string; name?: string; rating?: UserModelRating }
  pollTimer?: ReturnType<typeof setTimeout> | null
  fields: UserModelEditableFields
  sha256: string | null
  hashAbort: AbortController | null
  uploader: MultipartUploader | null
  onComplete?(job: UploadJob): void
}

let jobs: UploadJob[] = []
const internals = new Map<string, JobInternal>()
const listeners = new Set<() => void>()

const emit = () => {
  for (const listener of listeners) listener()
  syncBeforeUnload()
}

const patchJob = (id: string, patch: Partial<UploadJob>) => {
  jobs = jobs.map((job) => (job.id === id ? { ...job, ...patch } : job))
  emit()
}

const findJob = (id: string) => jobs.find((job) => job.id === id) ?? null

export const isActiveUploadStatus = (status: UploadJobStatus): boolean => {
  return (
    status === "hashing" ||
    status === "starting" ||
    status === "uploading" ||
    status === "completing" ||
    status === "importing"
  )
}

const onBeforeUnload = (event: BeforeUnloadEvent) => {
  event.preventDefault()
}

let isBeforeUnloadBound = false

/**
 * 送信中はページを閉じる前に確認する
 */
const syncBeforeUnload = () => {
  if (typeof window === "undefined") return
  // URL からの取り込みはサーバー側で続くので確認しない
  const hasActive = jobs.some(
    (job) => job.source === "file" && isActiveUploadStatus(job.status),
  )
  if (hasActive && !isBeforeUnloadBound) {
    window.addEventListener("beforeunload", onBeforeUnload)
    isBeforeUnloadBound = true
  } else if (!hasActive && isBeforeUnloadBound) {
    window.removeEventListener("beforeunload", onBeforeUnload)
    isBeforeUnloadBound = false
  }
}

const errorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error && error.message ? error.message : fallback
}

const runUploader = async (id: string) => {
  const internal = internals.get(id)
  const job = findJob(id)
  if (!internal?.uploader || !internal.sha256 || !job?.modelId) return
  const { uploader, sha256 } = internal
  const modelId = job.modelId

  patchJob(id, { status: "uploading", message: null })
  try {
    const parts = await uploader.start()
    writeResumeCache(sha256, { modelId, parts })
    patchJob(id, { status: "completing" })
    const model = await completeUserModelUpload(modelId, parts)
    writeResumeCache(sha256, null)
    internal.uploader = null
    patchJob(id, { status: "done", model, progress: uploader.progress })
    const done = findJob(id)
    if (done) internal.onComplete?.(done)
  } catch (error) {
    if (findJob(id)?.status === "canceled") return
    writeResumeCache(sha256, { modelId, parts: uploader.uploadedParts })
    if (error instanceof DOMException && error.name === "AbortError") {
      patchJob(id, { status: "paused", progress: uploader.progress })
      return
    }
    patchJob(id, {
      status: "paused",
      progress: uploader.progress,
      message: `${errorMessage(error, "送信に失敗しました")}。再開すると続きから送れます`,
    })
  }
}

const startJob = async (id: string) => {
  const internal = internals.get(id)
  const job = findJob(id)
  if (!internal?.file || !job) return
  const file = internal.file

  // 1. ハッシュ（同じファイルの重複チェックと再開に使う）
  if (internal.sha256 === null) {
    const controller = new AbortController()
    internal.hashAbort = controller
    patchJob(id, { status: "hashing", hashedBytes: 0, message: null })
    let lastUpdate = 0
    try {
      internal.sha256 = await computeFileSha256(file, {
        signal: controller.signal,
        onProgress: (hashedBytes) => {
          const now = Date.now()
          if (now - lastUpdate < 150 && hashedBytes < file.size) return
          lastUpdate = now
          patchJob(id, { hashedBytes })
        },
      })
    } catch (error) {
      if (controller.signal.aborted) return
      patchJob(id, {
        status: "error",
        message: errorMessage(error, "ファイルを読み込めませんでした"),
      })
      return
    } finally {
      internal.hashAbort = null
    }
  }

  const sha256 = internal.sha256
  if (findJob(id)?.status === "canceled") return

  // 2. アップロードの開始
  patchJob(id, { status: "starting" })
  try {
    const started = await startUserModelUpload({
      ...internal.fields,
      name: internal.fields.name.trim(),
      kind: job.kind,
      filename: file.name,
      sizeBytes: file.size,
      sha256,
    })

    if (!findJob(id) || findJob(id)?.status === "canceled") {
      if (!started.deduplicated) {
        abortUserModelUpload(started.modelId).catch(() => {})
      }
      return
    }

    if (started.deduplicated) {
      patchJob(id, {
        status: "done",
        modelId: started.modelId,
        deduplicated: true,
      })
      const done = findJob(id)
      if (done) internal.onComplete?.(done)
      return
    }

    const cached = readResumeCache(sha256)
    const uploadedParts = new Map<number, UploadedPart>()
    if (cached?.modelId === started.modelId) {
      for (const part of cached.parts) uploadedParts.set(part.partNumber, part)
    }
    for (const part of started.uploadedParts ?? []) {
      uploadedParts.set(part.partNumber, part)
    }

    let lastRender = 0
    internal.uploader = new MultipartUploader({
      file,
      partSize: started.partSize > 0 ? started.partSize : USER_MODEL_PART_SIZE,
      concurrency: 3,
      uploadedParts: [...uploadedParts.values()],
      sendPart: async ({ partNumber, blob, signal, onProgress }) => {
        const headers = await getUserModelsAuthHeaders(true)
        return uploadUserModelPart({
          modelId: started.modelId,
          partNumber,
          blob,
          authorization: headers.authorization,
          onProgress,
          signal,
        })
      },
      onProgress: (progress) => {
        const now = Date.now()
        if (now - lastRender < 200) return
        lastRender = now
        if (findJob(id)?.status === "uploading") {
          patchJob(id, { progress })
        }
      },
    })
    patchJob(id, { modelId: started.modelId })
    await runUploader(id)
  } catch (error) {
    if (findJob(id)?.status === "canceled") return
    const isLimitExceeded =
      error instanceof UserModelsApiError && error.isLimitExceeded
    patchJob(id, {
      status: "error",
      isLimitExceeded,
      message: errorMessage(error, "アップロードを開始できませんでした"),
    })
  }
}

/**
 * アップロードを追加して開始する
 */
export const enqueueUserModelUpload = (input: {
  file: File
  kind: UserModelKind
  fields: UserModelEditableFields
  onComplete?(job: UploadJob): void
}): string => {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  internals.set(id, {
    file: input.file,
    fields: input.fields,
    sha256: null,
    hashAbort: null,
    uploader: null,
    onComplete: input.onComplete,
  })
  jobs = [
    {
      id,
      name: input.fields.name.trim() || input.file.name,
      fileName: input.file.name,
      kind: input.kind,
      sizeBytes: input.file.size,
      status: "hashing",
      hashedBytes: 0,
      progress: null,
      message: null,
      isLimitExceeded: false,
      modelId: null,
      model: null,
      deduplicated: false,
      source: "file",
      importProgress: null,
    },
    ...jobs,
  ]
  emit()
  startJob(id)
  return id
}

// ---- URL からの取り込み ----

const IMPORT_STORAGE_KEY = "aipictors.user-models.imports"

const readStoredImports = (): StoredImportJob[] => {
  if (typeof window === "undefined") return []
  try {
    return parseStoredImportJobs(
      window.localStorage.getItem(IMPORT_STORAGE_KEY),
      Date.now(),
    )
  } catch {
    return []
  }
}

const writeStoredImports = (items: StoredImportJob[]) => {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(IMPORT_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // 保存できなくても取り込みは続く（再読み込み後に進捗が出ないだけ）
  }
}

const storeImport = (item: StoredImportJob) => {
  writeStoredImports([
    item,
    ...readStoredImports().filter((stored) => stored.modelId !== item.modelId),
  ])
}

const unstoreImport = (modelId: string) => {
  writeStoredImports(
    readStoredImports().filter((stored) => stored.modelId !== modelId),
  )
}

const finishImport = (id: string, patch: Partial<UploadJob>) => {
  const internal = internals.get(id)
  const job = findJob(id)
  if (internal?.pollTimer) clearTimeout(internal.pollTimer)
  if (internal) internal.pollTimer = null
  if (job?.modelId) unstoreImport(job.modelId)
  patchJob(id, patch)
  const done = findJob(id)
  if (done?.status === "done") internal?.onComplete?.(done)
}

const pollImport = (id: string, attempt: number, delayMs: number) => {
  const internal = internals.get(id)
  if (!internal) return
  if (internal.pollTimer) clearTimeout(internal.pollTimer)
  internal.pollTimer = setTimeout(async () => {
    const job = findJob(id)
    if (!job?.modelId || job.status !== "importing") return
    try {
      const status = await fetchUserModelImportStatus(job.modelId)
      if (findJob(id)?.status !== "importing") return
      const importProgress = {
        state: status.status,
        partsDone: status.partsDone,
        partsTotal: status.partsTotal,
      }
      if (status.status === "READY") {
        finishImport(id, {
          status: "done",
          model: status.model,
          importProgress,
          sizeBytes: status.sizeBytes || job.sizeBytes,
        })
        return
      }
      if (status.status === "FAILED") {
        finishImport(id, {
          status: "error",
          importProgress,
          message: status.error ?? "取り込みに失敗しました",
        })
        return
      }
      patchJob(id, {
        importProgress,
        sizeBytes: status.sizeBytes || job.sizeBytes,
      })
      pollImport(
        id,
        attempt + 1,
        importPollDelayMs({ status: status.status, attempt }),
      )
    } catch (error) {
      if (error instanceof UserModelsApiError && error.status === 404) {
        finishImport(id, {
          status: "error",
          message: "取り込みが見つかりませんでした",
        })
        return
      }
      // 通信の失敗は間隔をあけて確認し直す（取り込み自体はサーバー側で続いている）
      pollImport(id, attempt + 1, 10000)
    }
  }, delayMs)
}

const startImportJob = async (id: string) => {
  const internal = internals.get(id)
  const job = findJob(id)
  if (!internal?.importInput || !job) return
  patchJob(id, { status: "starting", message: null, isLimitExceeded: false })
  try {
    const started = await startUserModelImport(internal.importInput)
    if (findJob(id)?.status === "canceled") {
      if (started.status !== "READY") {
        cancelUserModelImport(started.modelId).catch(() => {})
      }
      return
    }
    const importProgress = {
      state: started.status,
      partsDone: started.partsDone,
      partsTotal: started.partsTotal,
    }
    if (started.status === "READY") {
      finishImport(id, {
        status: "done",
        modelId: started.modelId,
        model: started.model,
        deduplicated: started.deduplicated,
        importProgress,
      })
      return
    }
    storeImport({
      modelId: started.modelId,
      name: job.name,
      kind: job.kind,
      sizeBytes: job.sizeBytes,
      startedAt: Date.now(),
    })
    patchJob(id, {
      status: "importing",
      modelId: started.modelId,
      importProgress,
    })
    pollImport(id, 0, 2000)
  } catch (error) {
    if (findJob(id)?.status === "canceled") return
    patchJob(id, {
      status: "error",
      isLimitExceeded:
        error instanceof UserModelsApiError && error.isLimitExceeded,
      message: errorMessage(error, "取り込みを開始できませんでした"),
    })
  }
}

const newJobId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const urlJob = (props: {
  id: string
  name: string
  kind: UserModelKind
  sizeBytes: number
  fileName: string
}): UploadJob => ({
  id: props.id,
  name: props.name,
  fileName: props.fileName,
  kind: props.kind,
  sizeBytes: props.sizeBytes,
  status: "starting",
  hashedBytes: 0,
  progress: null,
  message: null,
  isLimitExceeded: false,
  modelId: null,
  model: null,
  deduplicated: false,
  source: "url",
  importProgress: null,
})

/**
 * URL（Civitai）からの取り込みを追加して開始する。進捗は右下のパネルに出る
 */
export const enqueueUserModelImport = (input: {
  url: string
  name: string
  rating?: UserModelRating
  kind: UserModelKind
  sizeBytes: number
  fileName: string
  onComplete?(job: UploadJob): void
}): string => {
  const id = newJobId()
  internals.set(id, {
    file: null,
    importInput: { url: input.url, name: input.name, rating: input.rating },
    pollTimer: null,
    fields: emptyFieldsFor(input.name),
    sha256: null,
    hashAbort: null,
    uploader: null,
    onComplete: input.onComplete,
  })
  jobs = [
    urlJob({
      id,
      name: input.name,
      kind: input.kind,
      sizeBytes: input.sizeBytes,
      fileName: input.fileName,
    }),
    ...jobs,
  ]
  emit()
  startImportJob(id)
  return id
}

const emptyFieldsFor = (name: string): UserModelEditableFields => ({
  name,
  description: "",
  triggerWords: "",
  recommendedWeight: 0.8,
  baseModel: "OTHER",
  rating: "G",
  tags: [],
  thumbnailUrl: null,
  sampleImageUrls: [],
})

let isImportRestored = false

/**
 * 再読み込みの前に始めた取り込みの進捗をもう一度出す
 */
const restoreStoredImports = () => {
  if (isImportRestored || typeof window === "undefined") return
  isImportRestored = true
  const stored = readStoredImports()
  if (stored.length === 0) return
  const known = new Set(jobs.map((job) => job.modelId))
  const restored: UploadJob[] = []
  for (const item of stored) {
    if (known.has(item.modelId)) continue
    const id = newJobId()
    internals.set(id, {
      file: null,
      pollTimer: null,
      fields: emptyFieldsFor(item.name),
      sha256: null,
      hashAbort: null,
      uploader: null,
    })
    restored.push({
      ...urlJob({
        id,
        name: item.name,
        kind: item.kind,
        sizeBytes: item.sizeBytes,
        fileName: item.name,
      }),
      status: "importing",
      modelId: item.modelId,
    })
  }
  if (restored.length === 0) return
  jobs = [...restored, ...jobs]
  emit()
  for (const job of restored) pollImport(job.id, 0, 500)
}

export const pauseUserModelUpload = (id: string) => {
  internals.get(id)?.uploader?.pause()
}

export const resumeUserModelUpload = (id: string) => {
  const internal = internals.get(id)
  const job = findJob(id)
  if (!internal || !job) return
  if (job.source === "url") {
    if (internal.importInput) startImportJob(id)
    return
  }
  if (internal.uploader && job.modelId) {
    runUploader(id)
    return
  }
  // 開始前に失敗したものは最初からやり直す（ハッシュは使い回す）
  startJob(id)
}

export const cancelUserModelUpload = async (id: string) => {
  const internal = internals.get(id)
  const job = findJob(id)
  if (!internal || !job) return
  patchJob(id, { status: "canceled" })
  if (job.source === "url") {
    if (internal.pollTimer) clearTimeout(internal.pollTimer)
    internal.pollTimer = null
    if (job.modelId && job.status !== "done") {
      unstoreImport(job.modelId)
      try {
        await cancelUserModelImport(job.modelId)
      } catch {
        // すでに終わっていた・失敗していた場合は何もしない
      }
    }
    dismissUserModelUpload(id)
    return
  }
  internal.hashAbort?.abort()
  internal.uploader?.pause()
  internal.uploader = null
  if (internal.sha256) writeResumeCache(internal.sha256, null)
  if (job.modelId && job.status !== "done") {
    try {
      await abortUserModelUpload(job.modelId)
    } catch {
      // 破棄に失敗しても API 側の期限切れで消える
    }
  }
  dismissUserModelUpload(id)
}

/**
 * 一覧から消す（送信中のものは消さない）
 */
export const dismissUserModelUpload = (id: string) => {
  const job = findJob(id)
  if (job && isActiveUploadStatus(job.status)) return
  internals.delete(id)
  jobs = jobs.filter((item) => item.id !== id)
  emit()
}

/**
 * 終わったもの（完了・中止・失敗）を一覧から消す
 */
export const clearFinishedUserModelUploads = () => {
  const isFinished = (job: UploadJob) =>
    job.status === "done" || job.status === "canceled" || job.status === "error"
  for (const job of jobs) {
    if (isFinished(job)) internals.delete(job.id)
  }
  jobs = jobs.filter((job) => !isFinished(job))
  emit()
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  // subscribe の中で通知しないよう、次のタスクで復元する
  if (!isImportRestored) setTimeout(restoreStoredImports, 0)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => jobs

const emptyJobs: UploadJob[] = []

const getServerSnapshot = () => emptyJobs

/**
 * アップロード中の一覧（ダイアログを閉じても続く）
 */
export function useUserModelUploads(): UploadJob[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/**
 * 進捗率（0〜100）
 */
export const uploadJobPercent = (job: UploadJob): number => {
  if (job.status === "done") return 100
  if (job.source === "url") {
    return job.importProgress
      ? importPercent({
          status: job.importProgress.state,
          partsDone: job.importProgress.partsDone,
          partsTotal: job.importProgress.partsTotal,
        })
      : 0
  }
  if (job.status === "hashing") {
    return job.sizeBytes > 0
      ? Math.min(100, (job.hashedBytes / job.sizeBytes) * 100)
      : 0
  }
  if (!job.progress || job.progress.totalBytes <= 0) return 0
  return Math.min(
    100,
    (job.progress.uploadedBytes / job.progress.totalBytes) * 100,
  )
}
