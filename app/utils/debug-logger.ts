/**
 * 開発環境でのみログを出力するデバッグ用ユーティリティ
 * モバイル端末でのパフォーマンス問題調査用とパフォーマンス最適化
 */

const isDevelopment = import.meta.env.MODE === "development"

// モバイル端末の検出
const isMobileDevice = (): boolean => {
  if (typeof navigator === "undefined") return false
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  )
}

// モバイル端末でのログを制限（パフォーマンス向上）
const shouldLog = (category: string): boolean => {
  if (!isDevelopment) return false

  // モバイル端末では重要なログのみ出力
  if (isMobileDevice()) {
    return ["auth", "mobile"].includes(category)
  }

  return true
}

type DebugLog = {
  auth: (message: string, data?: unknown) => void
  mobile: (message: string, data?: unknown) => void
  user: (message: string, data?: unknown) => void
  notification: (message: string, data?: unknown) => void
  performance: (message: string, data?: unknown) => void
  mobileLite: (message: string) => void
}

export const debugLog: DebugLog = {
  auth: (message: string, data?: unknown) => {
    if (shouldLog("auth")) {
      console.log(`🔐 ${message}`, data)
    }
  },
  mobile: (message: string, data?: unknown) => {
    if (shouldLog("mobile")) {
      console.log(`📱 ${message}`, data)
    }
  },
  user: (message: string, data?: unknown) => {
    if (shouldLog("user")) {
      console.log(`👤 ${message}`, data)
    }
  },
  notification: (message: string, data?: unknown) => {
    if (shouldLog("notification")) {
      console.log(`🔔 ${message}`, data)
    }
  },
  performance: (message: string, data?: unknown) => {
    if (shouldLog("performance")) {
      console.log(`⚡ ${message}`, data)
    }
  },
  // モバイル専用の軽量ログ（最小限の情報のみ）
  mobileLite: (message: string) => {
    if (isDevelopment && isMobileDevice()) {
      console.log(`📱💡 ${message}`)
    }
  },
}

/**
 * レンダリングパフォーマンス計測用ユーティリティ
 */
type PerformanceTimer = {
  start: (label: string) => void
  end: (label: string) => void
}

const performanceTimer: PerformanceTimer = {
  start: (label: string) => {
    if (isDevelopment && typeof performance !== "undefined") {
      performance.mark(`${label}-start`)
    }
  },
  end: (label: string) => {
    if (isDevelopment && typeof performance !== "undefined") {
      performance.mark(`${label}-end`)
      try {
        performance.measure(label, `${label}-start`, `${label}-end`)
        const measures = performance.getEntriesByName(label)
        const lastMeasure = measures[measures.length - 1]
        debugLog.performance(
          `${label} took ${lastMeasure.duration.toFixed(2)}ms`,
        )
      } catch {
        // パフォーマンス計測に失敗してもアプリケーションには影響しない
      }
    }
  },
}
