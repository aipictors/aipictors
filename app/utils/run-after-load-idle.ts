/**
 * ページの読み込み完了後、ブラウザがアイドルになってから処理を実行する
 * 計測・エラー監視などの初期表示に不要な処理を、表示を妨げないよう後回しにする
 */
export function runAfterLoadIdle(callback: () => void, timeout = 5000): void {
  if (typeof window === "undefined") return

  const runIdle = () => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => callback(), { timeout })
      return
    }
    setTimeout(callback, 200)
  }

  if (document.readyState === "complete") {
    runIdle()
    return
  }

  window.addEventListener("load", runIdle, { once: true })
}

/**
 * firebase/analytics は gtag.js を読み込むため、必要になるまで import しない
 */
export function withFirebaseAnalytics(
  callback: (analytics: typeof import("firebase/analytics")) => void,
): void {
  runAfterLoadIdle(() => {
    import("firebase/analytics")
      .then((analytics) => {
        try {
          callback(analytics)
        } catch (error) {
          console.warn("Analytics error:", error)
        }
      })
      .catch((error) => {
        console.warn("Analytics load failed:", error)
      })
  })
}
