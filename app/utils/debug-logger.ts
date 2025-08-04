/**
 * 開発環境でのみログを出力するデバッグ用ユーティリティ
 * モバイル端末でのパフォーマンス問題調査用
 */

const isDevelopment = import.meta.env.MODE === "development"

export const debugLog = {
  auth: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.log(`🔐 ${message}`, data)
    }
  },
  mobile: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.log(`📱 ${message}`, data)
    }
  },
  user: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.log(`👤 ${message}`, data)
    }
  },
  notification: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.log(`🔔 ${message}`, data)
    }
  },
  performance: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.log(`⚡ ${message}`, data)
    }
  },
}

/**
 * レンダリングパフォーマンス計測用ユーティリティ
 */
export const performanceTimer = {
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
      } catch (error) {
        // パフォーマンス計測に失敗してもアプリケーションには影響しない
      }
    }
  },
}
