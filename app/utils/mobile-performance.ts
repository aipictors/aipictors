/**
 * モバイルパフォーマンス最適化のためのユーティリティ
 * バンドルサイズとレンダリングパフォーマンスを改善する
 */

// デバウンス関数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// スロットル関数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 画像の事前読み込み
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

// WebP サポートの検出
export function detectWebPSupport(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false)

  return new Promise((resolve) => {
    const webP = new Image()
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2)
    }
    webP.src =
      "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA"
  })
}

// リソースヒントの追加
export function addResourceHint(
  href: string,
  rel: "preload" | "prefetch" | "dns-prefetch" | "preconnect",
  as?: string,
): void {
  if (typeof document === "undefined") return

  const existingLink = document.querySelector(`link[href="${href}"]`)
  if (existingLink) return

  const link = document.createElement("link")
  link.rel = rel
  link.href = href
  if (as) link.as = as

  document.head.appendChild(link)
}

// モバイルデバイスの検出
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false

  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    ) || window.innerWidth < 768
  )
}

// バンドルサイズ警告（開発環境のみ）
export function warnLargeBundle(componentName: string, sizeKB: number): void {
  if (process.env.NODE_ENV === "development" && sizeKB > 100) {
    console.warn(
      `⚠️ Large bundle detected: ${componentName} (${sizeKB}KB). Consider code splitting.`,
    )
  }
}

// パフォーマンス監視
export function measurePerformance(name: string, fn: () => void): void {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") {
    fn()
    return
  }

  const start = performance.now()
  fn()
  const end = performance.now()

  const duration = end - start
  if (duration > 16) {
    // 60fps threshold
    console.warn(`🐌 Slow operation: ${name} took ${duration.toFixed(2)}ms`)
  }
}
