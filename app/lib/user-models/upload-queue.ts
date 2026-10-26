import { useSyncExternalStore } from "react"
import {
  abortUserModelUpload,
  completeUserModelUpload,
  getUserModelsAuthHeaders,
  startUserModelUpload,
  UserModelsApiError,
  uploadUserModelPart,
} from "~/lib/user-models/client"
import { USER_MODEL_PART_SIZE } from "~/lib/user-models/constants"
import {
  readResumeCache,
  writeResumeCache,
} from "~/lib/user-models/resume-cache"
import type {
  UploadedPart,
  UserModel,
  UserModelEditableFields,
  UserModelKind,
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
}

type JobInternal = {
  file: File
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
    status === "completing"
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
  const hasActive = jobs.some((job) => isActiveUploadStatus(job.status))
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
  if (!internal || !job) return

  // 1. ハッシュ（同じファイルの重複チェックと再開に使う）
  if (internal.sha256 === null) {
    const controller = new AbortController()
    internal.hashAbort = controller
    patchJob(id, { status: "hashing", hashedBytes: 0, message: null })
    let lastUpdate = 0
    try {
      internal.sha256 = await computeFileSha256(internal.file, {
        signal: controller.signal,
        onProgress: (hashedBytes) => {
          const now = Date.now()
          if (now - lastUpdate < 150 && hashedBytes < internal.file.size) return
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
      filename: internal.file.name,
      sizeBytes: internal.file.size,
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
      file: internal.file,
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
    },
    ...jobs,
  ]
  emit()
  startJob(id)
  return id
}

export const pauseUserModelUpload = (id: string) => {
  internals.get(id)?.uploader?.pause()
}

export const resumeUserModelUpload = (id: string) => {
  const internal = internals.get(id)
  const job = findJob(id)
  if (!internal || !job) return
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
