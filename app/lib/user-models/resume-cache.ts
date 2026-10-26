import type { UploadedPart } from "~/lib/user-models/types"

/**
 * 中断したアップロードの再開用（sha256 ごとに送信済みパートを保存）
 */
export type ResumeCache = {
  modelId: string
  parts: UploadedPart[]
}

const resumeKey = (sha256: string) => `aipictors.user-model-upload.${sha256}`

export const readResumeCache = (sha256: string): ResumeCache | null => {
  try {
    const text = localStorage.getItem(resumeKey(sha256))
    return text ? (JSON.parse(text) as ResumeCache) : null
  } catch {
    return null
  }
}

export const writeResumeCache = (sha256: string, cache: ResumeCache | null) => {
  try {
    if (cache === null) {
      localStorage.removeItem(resumeKey(sha256))
    } else {
      localStorage.setItem(resumeKey(sha256), JSON.stringify(cache))
    }
  } catch {
    // 保存できなくても API の uploadedParts で再開できる
  }
}
