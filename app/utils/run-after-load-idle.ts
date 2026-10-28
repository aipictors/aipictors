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
 * 計測（gtag.js）を始める時間。ページを操作するか、読み込みが終わってからこの時間がたったら始める
 */
const ANALYTICS_DELAY_MS = 6000

let analyticsReady: Promise<void> | null = null

/**
 * 最初の操作（タップ・クリック・キー入力・スクロール）か、読み込み完了から ANALYTICS_DELAY_MS 後のどちらか早い方
 * （gtag.js は読み込みと実行で 0.3 秒ほどメインスレッドを止めるので、表示直後の操作の邪魔をしないように後にする）
 */
function waitForAnalyticsStart(): Promise<void> {
  if (analyticsReady) return analyticsReady
  analyticsReady = new Promise<void>((resolve) => {
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const
    let started = false
    const start = () => {
      if (started) return
      started = true
      for (const name of events) window.removeEventListener(name, start)
      resolve()
    }
    for (const name of events) {
      window.addEventListener(name, start, { once: true, passive: true })
    }
    runAfterLoadIdle(() => setTimeout(start, ANALYTICS_DELAY_MS))
  })
  return analyticsReady
}

/**
 * firebase/analytics は gtag.js を読み込むため、必要になるまで import しない
 */
export function withFirebaseAnalytics(
  callback: (analytics: typeof import("firebase/analytics")) => void,
): void {
  if (typeof window === "undefined") return
  waitForAnalyticsStart().then(() => {
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
