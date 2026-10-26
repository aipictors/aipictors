import { memo } from "react"

type Props = {
  src: string
  alt: string
  className?: string
  fetchPriority?: "high" | "low" | "auto"
  loading?: "lazy" | "eager"
  width?: number
  height?: number
  onLoad?: () => void
  onError?: () => void
  style?: React.CSSProperties
}

/**
 * パフォーマンス最適化された画像コンポーネント
 * - ブラウザ標準の loading 属性による遅延読み込み
 * - width / height 指定によるレイアウトシフト防止
 * - SSR とハイドレーションで同じ DOM を出力する（UA で出し分けるとハイドレーションに失敗し、
 *   ページ全体がクライアントで再描画されてしまう）
 */
const OptimizedImage = memo((props: Props) => {
  return (
    <img
      src={props.src}
      alt={props.alt}
      className={props.className}
      fetchPriority={props.fetchPriority}
      loading={props.loading ?? "lazy"}
      width={props.width}
      height={props.height}
      onLoad={props.onLoad}
      onError={props.onError}
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
})

OptimizedImage.displayName = "OptimizedImage"

export { OptimizedImage }
