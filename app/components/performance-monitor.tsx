import { useEffect } from "react"

/**
 * Web Vitals を監視してパフォーマンスメトリクスを収集するコンポーネント
 * モバイルパフォーマンスの改善状況を追跡する
 */
export function PerformanceMonitor (): React.ReactNode {
  useEffect(() => {
    // Web Vitals の監視
    if (typeof window !== "undefined" && "performance" in window) {
      // LCP (Largest Contentful Paint) の監視
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "largest-contentful-paint") {
            console.log(`LCP: ${entry.startTime}ms`)
          }
        }
      })

      try {
        observer.observe({ entryTypes: ["largest-contentful-paint"] })
      } catch (error) {
        console.warn("Performance monitoring not supported:", error)
      }

      // CLS (Cumulative Layout Shift) の監視
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & {
            hadRecentInput?: boolean
            value?: number
          }

          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value ?? 0
          }
        }
        console.log(`CLS: ${clsValue}`)
      })

      try {
        clsObserver.observe({ entryTypes: ["layout-shift"] })
      } catch (error) {
        console.warn("Layout shift monitoring not supported:", error)
      }

      // FID (First Input Delay) の監視
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(
            `FID: ${(entry as any).processingStart - entry.startTime}ms`,
          )
        }
      })

      try {
        fidObserver.observe({ entryTypes: ["first-input"] })
      } catch (error) {
        console.warn("First input delay monitoring not supported:", error)
      }

      return () => {
        observer.disconnect()
        clsObserver.disconnect()
        fidObserver.disconnect()
      }
    }
  }, [])

  // 開発環境でのみレンダリング
  if (process.env.NODE_ENV === "production") {
    return null
  }

  return null
}
