const PROGRESS_KEY = "r18NewWorksProgress"

export type SensitiveNewWorksProgress = {
  /** 最後に見たページ（0 始まり） */
  page: number
  /** 最後に見た時刻（ミリ秒） */
  at: number
}

export function readSensitiveNewWorksProgress(): SensitiveNewWorksProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (raw === null) return null
    const parsed = JSON.parse(raw)
    if (
      typeof parsed?.page !== "number" ||
      typeof parsed?.at !== "number" ||
      parsed.page < 0
    ) {
      return null
    }
    return { page: parsed.page, at: parsed.at }
  } catch {
    return null
  }
}

export function writeSensitiveNewWorksProgress(
  progress: SensitiveNewWorksProgress,
): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  } catch {
    // 保存できなくても一覧は使える
  }
}

/**
 * 前回の位置に戻るページ
 * 新着が増えると前回の作品は後ろへずれるので、増えた分のページを足す
 */
export function toResumePage(
  page: number,
  newCount: number,
  perPage: number,
): number {
  return page + Math.floor(newCount / perPage)
}
