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
}

/**
 * パフォーマンス最適化された画像コンポーネント
 * - intersection observer による遅延読み込み
 * - webp フォールバック対応
 * - プリロード最適化
 * - SSR対応でチカチカ防止
 */
const OptimizedImage = memo((props: Props) => {
  // WebP対応の確認とフォールバック
  const optimizedSrc = useMemo(() => {
    // WebPサポートがある場合、src を WebP に変換を試行
    if (typeof window !== "undefined") {
      // URLがjpg, jpeg, pngの場合、webpバージョンを試行
      if (props.src.match(/\.(jpg|jpeg|png)$/i)) {
        return props.src.replace(/\.(jpg|jpeg|png)$/i, ".webp")
      }
    }
    return props.src
  }, [props.src])

  // エラー時のフォールバック
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    if (img.src !== props.src && img.src.includes(".webp")) {
      // WebP読み込み失敗時、元の形式にフォールバック
      img.src = props.src
    }
    props.onError?.()
  }

  // 重要な画像またはeagerロードの場合は遅延読み込みをスキップ
  const shouldSkipLazyLoad = props.loading === "eager"

  if (shouldSkipLazyLoad) {
    return (
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
    )
  }

  return (
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
  )
})

OptimizedImage.displayName = "OptimizedImage"

export { OptimizedImage }
