// 改良版の無限スクロールフック
import { useEffect, useRef, type RefObject, useCallback } from "react"

type Opts = {
  hasNext: boolean
  loading: boolean
  threshold?: number
  rootMargin?: string
}

/**
 * 改良版の無限スクロール検出フック
 * - より確実にスクロールを検出するために複数のメカニズムを組み合わせる
 * - IntersectionObserver + スクロールイベント + マウント時チェック
 * - 画面内に入ったセンチネル要素を検出する
 */
export function useImprovedInfiniteScroll(
  onReachEnd: () => void,
  { hasNext, loading, threshold = 0.1, rootMargin = "600px" }: Opts,
): RefObject<HTMLDivElement> {
  const ref = useRef<HTMLDivElement>(null)
  const onReachEndRef = useRef(onReachEnd)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef(loading)
  const hasNextRef = useRef(hasNext)
  const loadTriggeredRef = useRef(false) // 連続実行防止フラグ

  // 参照を最新に保つ
  useEffect(() => {
    onReachEndRef.current = onReachEnd
    loadingRef.current = loading
    hasNextRef.current = hasNext

    // ロードが完了したらフラグをリセット
    if (!loading) {
      loadTriggeredRef.current = false
    }
  }, [onReachEnd, loading, hasNext])

  // セーフティロード関数 - 連続実行を防止
  const safeLoadMore = useCallback(() => {
    if (!hasNextRef.current || loadingRef.current || loadTriggeredRef.current)
      return

    console.log("Infinite scroll triggered load more")
    loadTriggeredRef.current = true
    onReachEndRef.current()
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // IntersectionObserverのコールバック関数
    const callback: IntersectionObserverCallback = (entries) => {
      const entry = entries[0]
      if (entry.isIntersecting) {
        safeLoadMore()
      }
    }

    // 以前のオブザーバーを切断
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // 新しいオブザーバーを作成 - より幅広いthresholdを設定
    observerRef.current = new IntersectionObserver(callback, {
      rootMargin,
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5], // 複数のしきい値でチェック
    })

    observerRef.current.observe(el)

    // バックアップメカニズム：スクロールイベントでも監視
    const handleScroll = () => {
      if (!el) return

      const rect = el.getBoundingClientRect()
      const windowHeight =
        window.innerHeight || document.documentElement.clientHeight

      // 要素が画面の下 1200px 以内に入ったら読み込み開始（余裕を持たせる）
      if (rect.top < windowHeight + 1200) {
        safeLoadMore()
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      window.removeEventListener("scroll", handleScroll)
    }
  }, [rootMargin, safeLoadMore])

  // コンポーネントがマウントされた時と、hasNextまたはloadingが変更された時に
  // 一度だけ手動でチェック
  useEffect(() => {
    // タイマーを使用して非同期で実行
    const timer = setTimeout(() => {
      const el = ref.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const windowHeight =
        window.innerHeight || document.documentElement.clientHeight

      // 要素が既に画面内にある場合は手動で読み込みをトリガー
      if (rect.top < windowHeight + 800) {
        safeLoadMore()
      }

      // 特殊ケース：非常に高さの小さいコンテンツの場合、スクロールせずに追加ロードが必要
      if (document.body.scrollHeight <= windowHeight) {
        safeLoadMore()
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [hasNext, loading, safeLoadMore])

  // ref.currentを返す
  return ref
}
