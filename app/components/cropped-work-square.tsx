import { Images, MessageCircleIcon } from "lucide-react"
import { OptimizedImage } from "~/components/optimized-image"
import { SensitiveThumbnailOverlay } from "~/components/sensitive/sensitive-thumbnail-overlay"
import { Badge } from "~/components/ui/badge"
import { WorkMediaBadge } from "~/components/work-media-badge"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { toResizedImageSrcSet } from "~/utils/resized-image-url"
import { toThumbnailObjectPosition } from "~/utils/thumbnail-object-position"

type Props = {
  workId: string
  imageUrl: string
  thumbnailImagePosition: number
  size: "xs" | "sm" | "md" | "lg" | "auto"
  imageWidth: number
  imageHeight: number
  ranking?: number
  subWorksCount?: number
  commentsCount?: number
  isPromptPublic?: boolean
  hasVideoUrl?: boolean
  videoUrl?: string | null
  streamUid?: string | null
  isAutoPlay?: boolean
  isGeneration?: boolean
  hasReferenceButton?: boolean
  onSelect?: (workId: string) => void
  shouldMaskSensitive?: boolean
  /** 最初に表示される画像（LCP 候補）なら true */
  isPriority?: boolean
  /**
   * 優先する画像を決めている一覧の、それ以外の画像なら true（fetchpriority="low"）。
   * 画面内の画像はブラウザが自動で優先度を上げるので、最初の画像（LCP）と回線を取り合っていた
   */
  isLowPriority?: boolean
  /** 作品タイトル（画像の代替テキストに使う） */
  title?: string
  /** 親要素がリンクやボタンの場合は true（a 要素の入れ子はハイドレーションエラーになるため） */
  isInsideInteractive?: boolean
  /** この条件の画面幅でだけ画像を読み込む（OptimizedImage の media） */
  media?: string
  /**
   * size="auto" のときの正方形の表示幅（sizes の書式）。
   * 省略時はスマホ 2 列・PC 240px 前後として扱う
   */
  displayWidth?: string
  /**
   * size="auto" で正方形ではなくこの縦横比（幅 / 高さ）の枠に入れる（石垣状の一覧。角も丸くする）
   */
  aspectRatio?: number
}

/** 正方形の表示幅（CSS） */
const SQUARE_WIDTH: Record<Exclude<Props["size"], "auto">, number> = {
  xs: 64,
  sm: 80,
  md: 128,
  lg: 160,
}

/**
 * 画像の sizes。正方形に切り抜くので、横長の画像は正方形より横にはみ出して表示される（幅 × 縦横比）
 */
function toSizes(props: Props): string {
  // 枠より横長な分だけ、表示幅より大きく表示される
  const ratio = Math.max(
    1,
    props.imageWidth /
      Math.max(1, props.imageHeight) /
      (props.aspectRatio ?? 1),
  )
  // 各候補の最後の長さだけを倍にする（メディア条件の (min-width: 768px) はそのまま）
  const scale = (value: string) =>
    value
      .split(",")
      .map((entry) =>
        entry.replace(
          /(\d+(?:\.\d+)?)(px|vw)\s*$/,
          (_, n: string, unit: string) =>
            `${Math.round(Number(n) * ratio)}${unit}`,
        ),
      )
      .join(",")
  if (props.size !== "auto") {
    return `${Math.round(SQUARE_WIDTH[props.size] * ratio)}px`
  }
  const base = scale(props.displayWidth ?? "(min-width: 768px) 240px, 48vw")
  // 遅延読み込みの画像は、実際の表示幅から選ばせる（対応ブラウザのみ）
  return props.isPriority ? base : `auto, ${base}`
}

/**
 * 四角形で作品をクロップして表示するコンポーネント
 */
export function CroppedWorkSquare(props: Props): React.ReactNode {
  // 仕様: 常に表示領域は正方形。auto は親グリッドセル幅にフィットして aspect-square。固定サイズは size-* で正方形。
  // 仕様: 短辺フィット (object-cover) + 長辺方向のみ object-position で位置を合わせる。オーバーレイのズレ防止のためラッパーを正方形サイズそのものにする。

  // 「サムネイルを調整」の位置で切り抜く（石垣状の枠でも同じ割合の位置にする）
  const cropStyle = {
    objectPosition: toThumbnailObjectPosition(
      props.thumbnailImagePosition,
      props.imageWidth,
      props.imageHeight,
    ),
  }

  const backgroundColor = () => {
    if (props.ranking === 1) return "#d6ba49"
    if (props.ranking === 2) return "#858585"
    if (props.ranking === 3) return "#c8a17e"
    return "#00000052"
  }

  const sizeClass = (() => {
    if (props.size === "auto") return "w-full" // aspect-square はフォールバック構造で保証
    if (props.size === "xs") return "size-16"
    if (props.size === "sm") return "size-20"
    if (props.size === "md") return "size-32"
    if (props.size === "lg") return "size-40"
    return "w-full"
  })()

  const chipClassName =
    "gap-x-1 border-border/40 bg-background/70 text-foreground backdrop-blur-sm"

  const mediaContent = (
    <>
      <OptimizedImage
        src={props.imageUrl}
        alt={props.title ?? ""}
        key={props.imageUrl}
        loading={props.isPriority ? "eager" : "lazy"}
        fetchPriority={
          props.isPriority ? "high" : props.isLowPriority ? "low" : undefined
        }
        media={props.media}
        srcSet={toResizedImageSrcSet(props.imageUrl, {
          minWidth: props.size === "auto" ? 160 : SQUARE_WIDTH[props.size],
          maxWidth: props.imageWidth,
        })}
        sizes={toSizes(props)}
        width={props.imageWidth}
        height={props.imageHeight}
        style={cropStyle}
        className="h-full w-full max-w-none rounded object-cover transition-transform duration-300 ease-in-out"
      />

      <SensitiveThumbnailOverlay
        imageUrl={props.imageUrl}
        imageWidth={props.imageWidth}
        imageHeight={props.imageHeight}
        isHidden={props.shouldMaskSensitive === true}
      />
    </>
  )

  if (props.size === "auto") {
    // フォールバック: aspect-ratio が環境/親レイアウト影響で期待通り効かないケースに対応
    // padding-bottom 100% で正方形スペースを確保し、その上に絶対配置でサムネイルを載せる
    return (
      <div className={cn("relative", sizeClass)}>
        <div
          className="w-full pb-[100%]"
          style={
            props.aspectRatio !== undefined
              ? { paddingBottom: `${(100 / props.aspectRatio).toFixed(2)}%` }
              : undefined
          }
        />
        <div className="absolute inset-0">
          <div
            className={cn(
              "relative block h-full w-full shrink-0 overflow-hidden",
              // アプリの作品カードと同じく角を大きめに丸める
              props.aspectRatio !== undefined
                ? "rounded-[14px] bg-muted"
                : "rounded-xl",
            )}
          >
            {props.isInsideInteractive ? (
              <div className="block h-full w-full transition-all duration-300 ease-in-out">
                {mediaContent}
              </div>
            ) : props.onSelect ? (
              <button
                type="button"
                onClick={() => props.onSelect?.(props.workId)}
                className="block h-full w-full cursor-pointer transition-all duration-300 ease-in-out"
              >
                {mediaContent}
              </button>
            ) : (
              <Link
                to={`/posts/${props.workId}`}
                aria-label={props.title ? undefined : "作品を見る"}
                className="block h-full w-full transition-all duration-300 ease-in-out"
              >
                {mediaContent}
              </Link>
            )}

            {props.ranking && (
              <div
                className="absolute bottom-2 left-2 flex size-6 items-center justify-center rounded-full font-bold text-white text-xs"
                style={{ backgroundColor: backgroundColor() }}
              >
                {props.ranking}
              </div>
            )}

            {props.subWorksCount !== undefined && props.subWorksCount !== 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  "absolute top-1 right-1 flex items-center",
                  chipClassName,
                )}
              >
                <Images className="size-3 text-muted-foreground" />
                <span className="font-semibold text-xs leading-none">
                  {props.subWorksCount + 1}
                </span>
              </Badge>
            )}

            {props.commentsCount !== undefined && props.commentsCount !== 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  "absolute top-1 left-1 flex items-center",
                  chipClassName,
                )}
              >
                <MessageCircleIcon className="size-3 text-muted-foreground" />
                <span className="font-semibold text-xs leading-none">
                  {props.commentsCount}
                </span>
              </Badge>
            )}

            <div
              className={cn(
                // いいねボタンが右下にあるので、プロンプト公開などのバッジは左下に固定する（右に寄せると重なって押しづらい）。
                // 順位の丸があるときはその右に並べる
                "pointer-events-none absolute z-10",
                props.ranking ? "left-9" : "left-1",
                props.hasReferenceButton ? "bottom-12" : "bottom-2",
              )}
            >
              <WorkMediaBadge
                isPromptPublic={props.isPromptPublic}
                hasVideoUrl={props.hasVideoUrl}
                isGeneration={props.isGeneration}
                hasReferenceButton={props.hasReferenceButton}
                size="md"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative block shrink-0 overflow-hidden rounded",
        sizeClass,
      )}
    >
      {props.isInsideInteractive ? (
        <div className="block h-full w-full transition-all duration-300 ease-in-out">
          {mediaContent}
        </div>
      ) : (
        <Link
          to={`/posts/${props.workId}`}
          aria-label={props.title ? undefined : "作品を見る"}
          className="block h-full w-full transition-all duration-300 ease-in-out"
        >
          {mediaContent}
        </Link>
      )}

      {props.ranking && (
        <div
          className="absolute bottom-2 left-2 flex size-6 items-center justify-center rounded-full font-bold text-white text-xs"
          style={{ backgroundColor: backgroundColor() }}
        >
          {props.ranking}
        </div>
      )}

      {props.subWorksCount !== undefined && props.subWorksCount !== 0 && (
        <Badge
          variant="secondary"
          className={cn(
            "absolute top-1 right-1 flex items-center",
            chipClassName,
          )}
        >
          <Images className="size-3 text-muted-foreground" />
          <span className="font-semibold text-xs leading-none">
            {props.subWorksCount + 1}
          </span>
        </Badge>
      )}

      {props.commentsCount !== undefined && props.commentsCount !== 0 && (
        <Badge
          variant="secondary"
          className={cn(
            "absolute top-1 left-1 flex items-center",
            chipClassName,
          )}
        >
          <MessageCircleIcon className="size-3 text-muted-foreground" />
          <span className="font-semibold text-xs leading-none">
            {props.commentsCount}
          </span>
        </Badge>
      )}

      <div
        className={cn(
          // いいねボタンが右下にあるので、プロンプト公開などのバッジは左下に固定する（右に寄せると重なって押しづらい）。
          // 順位の丸があるときはその右に並べる
          "pointer-events-none absolute z-10",
          props.ranking ? "left-9" : "left-1",
          props.hasReferenceButton ? "bottom-12" : "bottom-2",
        )}
      >
        <WorkMediaBadge
          isPromptPublic={props.isPromptPublic}
          hasVideoUrl={props.hasVideoUrl}
          isGeneration={props.isGeneration}
          hasReferenceButton={props.hasReferenceButton}
          size={props.size === "xs" || props.size === "sm" ? "sm" : "md"}
        />
      </div>
    </div>
  )
}
