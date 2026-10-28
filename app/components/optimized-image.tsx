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
  /**
   * この条件の画面幅でだけ画像を読み込む（例: "(min-width: 768px)"）。
   * PC 用・スマホ用の一覧を CSS で出し分けていると、display: none の側の画像もブラウザが読み込んでしまう
   * （トップのスマホ表示で、見えない PC 用一覧の画像を 30 枚以上・約 1.3MB 読んでいた）。
   * 条件に合わないときは 1px の透明画像に差し替える
   */
  media?: string
  /** 縮小版の候補（toResizedImageSrcSet） */
  srcSet?: string
  /** srcSet があるときの表示幅 */
  sizes?: string
}

const BLANK_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

/**
 * パフォーマンス最適化された画像コンポーネント
 * - ブラウザ標準の loading 属性による遅延読み込み
 * - width / height 指定によるレイアウトシフト防止
 * - SSR とハイドレーションで同じ DOM を出力する（UA で出し分けるとハイドレーションに失敗し、
 *   ページ全体がクライアントで再描画されてしまう）
 */
const OptimizedImage = memo((props: Props) => {
  const image = (
    <img
      src={props.src}
      srcSet={props.srcSet}
      sizes={props.srcSet ? props.sizes : undefined}
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
  if (!props.media) return image
  return (
    <picture className="contents">
      <source media={`not all and ${props.media}`} srcSet={BLANK_IMAGE} />
      {image}
    </picture>
  )
})

OptimizedImage.displayName = "OptimizedImage"

export { OptimizedImage }
