/**
 * AI生成機能の利用制限を管理するユーティリティ
 */

const DAILY_LIMIT = 50
const STORAGE_KEY = "ai_generation_usage"

type UsageData = {
  date: string
  count: number
}

/**
 * 今日の日付を取得（YYYY-MM-DD形式）
 */
function getTodayString(): string {
  const today = new Date()
  return today.toISOString().split("T")[0]
}

/**
 * ローカルストレージから利用状況を取得
 */
function getUsageData(): UsageData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return { date: getTodayString(), count: 0 }
    }

    const data = JSON.parse(stored) as UsageData
    const today = getTodayString()

    // 日付が変わっていたらカウントをリセット
    if (data.date !== today) {
      return { date: today, count: 0 }
    }

    return data
  } catch {
    return { date: getTodayString(), count: 0 }
  }
}

/**
 * ローカルストレージに利用状況を保存
 */
function saveUsageData(data: UsageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn("Failed to save usage data:", error)
  }
}

/**
 * 今日の残り利用回数を取得
 */
export function getRemainingUsage(): number {
  const usage = getUsageData()
  return Math.max(0, DAILY_LIMIT - usage.count)
}

/**
 * 利用可能かどうかをチェック
 */
export function canUseAiGeneration(): boolean {
  return getRemainingUsage() > 0
}

/**
 * 利用回数を1回消費
 */
export function consumeAiGenerationUsage(): boolean {
  const usage = getUsageData()

  if (usage.count >= DAILY_LIMIT) {
    return false
  }

  const newUsage: UsageData = {
    date: usage.date,
    count: usage.count + 1,
  }

  saveUsageData(newUsage)
  return true
}

/**
 * 今日の利用回数を取得
 */
export function getTodayUsageCount(): number {
  const usage = getUsageData()
  return usage.count
}

/**
 * 1日の利用上限を取得
 */
export function getDailyLimit(): number {
  return DAILY_LIMIT
}
