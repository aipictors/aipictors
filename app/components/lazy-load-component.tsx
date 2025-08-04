import { useEffect, useRef, useState } from "react"

type Props = {
  children: React.ReactNode
  fallback?: React.ReactNode
  rootMargin?: string
  threshold?: number
  // SSR対応とチカチキ防止のオプション
  disableOnServer?: boolean
  skipAnimation?: boolean
}

/**
 * Intersection Observer を使った遅延読み込みコンポーネント
 * ビューポートに入った時にのみ子コンポーネントを読み込む
 */
export function LazyLoadComponent(props: Props) {
  // SSR安全: サーバーサイドでは常にコンテンツを表示
  const [isVisible, setIsVisible] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // クライアントサイドでのマウント検出
  useEffect(() => {
    setIsMounted(true)

    // disableOnServer が true の場合は遅延読み込みを無効化
    if (props.disableOnServer) {
      return
    }

    // クライアントサイドでのみ遅延読み込み開始
    setIsVisible(false)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: props.rootMargin ?? "50px",
        threshold: props.threshold ?? 0.1,
      },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [props.disableOnServer, props.rootMargin, props.threshold])

  // SSR時またはdisableOnServerがtrueの場合は常にコンテンツを表示
  if (!isMounted || props.disableOnServer) {
    return <div ref={ref}>{props.children}</div>
  }

  return (
    <div ref={ref}>{isVisible ? props.children : (props.fallback ?? null)}</div>
  )
}
