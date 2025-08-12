import { memo, useMemo } from "react"
import { LazyLoadComponent } from "~/components/lazy-load-component"

type Props = {
  src: string
  alt: string
  className?: string
  loading?: "lazy" | "eager"
  width?: number
  height?: number
  onLoad?: () => void
  onError?: () => void
  style?: React.CSSProperties
}

/**
 * パフォーマンス最適化された画像コンポーネント
 * - intersection observer による遅延読み込み
 * - webp フォールバック対応（Safari対応強化）
 * - プリロード最適化
 * - SSR対応でチカチカ防止
 */
const OptimizedImage = memo((props: Props) => {
  // Safari向けWebP対応の確認とフォールバック
  const optimizedSrc = useMemo(() => {
    // Safari バージョン14以降でWebPサポートを確認
    if (typeof window !== "undefined") {
      // Safariでは積極的にWebP変換を行わず、元画像を優先
      const isSafari = /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent,
      )
      if (isSafari) {
        return props.src // SafariではWebP変換をスキップ
      }

      // 他のブラウザではWebP変換を試行
      if (props.src.match(/\.(jpg|jpeg|png)$/i)) {
        return props.src.replace(/\.(jpg|jpeg|png)$/i, ".webp")
      }
    }
    return props.src
  }, [props.src])

  // エラー時のフォールバック（Safari対応強化）
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    if (img.src !== props.src) {
      // WebP読み込み失敗時、元の形式にフォールバック
      img.src = props.src
      return
    }
    props.onError?.()
  }

  // 重要な画像またはeagerロードの場合は遅延読み込みをスキップ
  // Safari対応：スマホでは積極的にeager読み込みを行う
  const shouldSkipLazyLoad =
    props.loading === "eager" ||
    (typeof window !== "undefined" &&
      /iPhone|iPad|iPod|Mobile.*Safari/i.test(navigator.userAgent))

  if (shouldSkipLazyLoad) {
    return (
      <img
        src={optimizedSrc}
        alt={props.alt}
        className={props.className}
        loading={props.loading || "eager"}
        width={props.width}
        height={props.height}
        onLoad={props.onLoad}
        onError={handleError}
        decoding="async"
        // Safari対応：画像読み込み強制
        style={{
          WebkitBackfaceVisibility: "hidden",
          transform: "translateZ(0)",
          minWidth: "100%", // Safari対応：最小幅を保証
          minHeight: "100%", // Safari対応：最小高さを保証
          ...props.style,
        }}
      />
    )
  }

  return (
    <div className="overflow-hidden">
      <LazyLoadComponent
        disableOnServer={true} // SSR対応でチカチカ防止
        fallback={null} // fallbackは表示せずチカチカを防ぐ
      >
        <img
          src={optimizedSrc}
          alt={props.alt}
          className={props.className}
          loading={props.loading || "lazy"}
          width={props.width}
          height={props.height}
          onLoad={props.onLoad}
          onError={handleError}
          decoding="async"
        />
      </LazyLoadComponent>
    </div>
  )
})

OptimizedImage.displayName = "OptimizedImage"

export { OptimizedImage }
