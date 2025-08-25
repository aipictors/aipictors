import { Link } from "@remix-run/react"
import { Images, MessageCircleIcon } from "lucide-react"
import { cn } from "~/lib/utils"
import { OptimizedImage } from "~/components/optimized-image"
import { WorkMediaBadge } from "~/components/work-media-badge"

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
  isGeneration?: boolean
  hasReferenceButton?: boolean
  onSelect?: (workId: string) => void
}

/**
 * 四角形で作品をクロップして表示するコンポーネント
 */
export function CroppedWorkSquare(props: Props) {
  // 仕様: 常に表示領域は正方形。auto は親グリッドセル幅にフィットして aspect-square。固定サイズは size-* で正方形。
  // 仕様: 短辺フィット + 長辺方向のみ translate. オーバーレイのズレ防止のためラッパーを正方形サイズそのものにする。

  // 位置値を安全にクランプする (-50% ~ 50% を意図した可動域とする)
  const clampThumbnailPosition = (value: number) => {
    if (Number.isNaN(value)) return 0
    if (value > 50) return 50
    if (value < -50) return -50
    return value
  }

  type CropStyleParams = {
    imageWidth: number
    imageHeight: number
    thumbnailPosition: number
  }

  // 非常に横長対策: 以前は WIDE_CONTAIN_THRESHOLD 以上で object-fit:contain へ切替えていたが
  // 「縦幅がフィットせず小さく見える」フィードバックにより撤去。
  // 将来的に "過度な横拡大" を緩和したい場合は、scaleX で最大表示幅を制限する案を別途実装する。例:
  //   const MAX_DISPLAY_AR = 1.8; 高さ100%適用後 (実幅AR - MAX_DISPLAY_AR) を縮小率に反映 など。
  // const WIDE_CONTAIN_THRESHOLD = 1.4

  // サムネイルの中央寄せクロップ風スタイルを計算
  const computeCropStyle = ({
    imageWidth,
    imageHeight,
    thumbnailPosition,
  }: CropStyleParams) => {
    const aspectRatio = imageWidth / imageHeight
    const clampedPos = clampThumbnailPosition(thumbnailPosition || 0)

    // 横長: 高さ100%固定 (短辺=高さ) -> 幅は aspectRatio * 100% 分溢れる
    if (aspectRatio > 1) {
      const overflowRatio = aspectRatio - 1 // 追加で溢れる幅割合
      const maxTravelPercent = (overflowRatio / 2) * 100
      const translatePercent = (clampedPos / 50) * maxTravelPercent
      return {
        width: `${aspectRatio * 100}%`, // 明示的に幅を指定してoverflow確実化
        height: "100%",
        transform: `translateX(${translatePercent}%)`,
        objectFit: "cover" as const,
      }
    }

    // 縦長: 幅100%固定 (短辺=幅) -> 高さは (1/aspectRatio) * 100% 分溢れる
    if (aspectRatio < 1) {
      const overflowRatio = 1 / aspectRatio - 1
      const maxTravelPercent = (overflowRatio / 2) * 100
      const translatePercent = (clampedPos / 50) * maxTravelPercent
      return {
        width: "100%",
        height: `${(1 / aspectRatio) * 100}%`, // 明示的に高さを指定
        transform: `translateY(${translatePercent}%)`,
        objectFit: "cover" as const,
      }
    }

    // 正方形
    return {
      width: "100%",
      height: "100%",
      transform: "none",
      objectFit: "cover" as const,
    }
  }

  const cropStyle = computeCropStyle({
    imageWidth: props.imageWidth,
    imageHeight: props.imageHeight,
    thumbnailPosition: props.thumbnailImagePosition,
  })

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

  if (props.size === "auto") {
    // フォールバック: aspect-ratio が環境/親レイアウト影響で期待通り効かないケースに対応
    // padding-bottom 100% で正方形スペースを確保し、その上に絶対配置でサムネイルを載せる
    return (
      <div className={cn("relative", sizeClass)}>
        <div className="w-full pb-[100%]" />
        <div className="absolute inset-0">
          <div className="relative block h-full w-full shrink-0 overflow-hidden rounded">
            {props.onSelect ? (
              <button
                type="button"
                onClick={() => props.onSelect?.(props.workId)}
                className="block h-full w-full cursor-pointer transition-all duration-300 ease-in-out"
              >
                <OptimizedImage
                  src={props.imageUrl}
                  alt=""
                  key={props.imageUrl}
                  loading="lazy"
                  width={props.imageWidth}
                  height={props.imageHeight}
                  style={cropStyle}
                  className="h-full w-full max-w-none rounded object-cover transition-transform duration-300 ease-in-out"
                />
              </button>
            ) : (
              <Link
                to={`/posts/${props.workId}`}
                className="block h-full w-full transition-all duration-300 ease-in-out"
              >
                <OptimizedImage
                  src={props.imageUrl}
                  alt=""
                  key={props.imageUrl}
                  loading="lazy"
                  width={props.imageWidth}
                  height={props.imageHeight}
                  style={cropStyle}
                  className="h-full w-full max-w-none rounded object-cover transition-transform duration-300 ease-in-out"
                />
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
              <div className="absolute top-1 right-1 flex items-center space-x-1 rounded-xl bg-zinc-800 bg-opacity-50 p-1 px-2">
                <Images className="size-3 text-white" />
                <div className="font-bold text-white text-xs">
                  {props.subWorksCount + 1}
                </div>
              </div>
            )}

            {props.commentsCount !== undefined && props.commentsCount !== 0 && (
              <div className="absolute top-1 left-1 flex items-center space-x-1 rounded-xl bg-zinc-800 bg-opacity-50 p-1 px-2">
                <MessageCircleIcon className="size-3 text-white" />
                <div className="font-bold text-white text-xs">
                  {props.commentsCount + 1}
                </div>
              </div>
            )}

            <div
              className={cn(
                "absolute z-10",
                props.commentsCount !== undefined && props.commentsCount !== 0
                  ? "right-1"
                  : "left-1",
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
      <Link
        to={`/posts/${props.workId}`}
        className="block h-full w-full transition-all duration-300 ease-in-out"
      >
        <OptimizedImage
          src={props.imageUrl}
          alt=""
          key={props.imageUrl}
          loading="lazy"
          width={props.imageWidth}
          height={props.imageHeight}
          style={cropStyle}
          className="h-full w-full max-w-none rounded object-cover transition-transform duration-300 ease-in-out"
        />
      </Link>

      {props.ranking && (
        <div
          className="absolute bottom-2 left-2 flex size-6 items-center justify-center rounded-full font-bold text-white text-xs"
          style={{ backgroundColor: backgroundColor() }}
        >
          {props.ranking}
        </div>
      )}

      {props.subWorksCount !== undefined && props.subWorksCount !== 0 && (
        <div className="absolute top-1 right-1 flex items-center space-x-1 rounded-xl bg-zinc-800 bg-opacity-50 p-1 px-2">
          <Images className="size-3 text-white" />
          <div className="font-bold text-white text-xs">
            {props.subWorksCount + 1}
          </div>
        </div>
      )}

      {props.commentsCount !== undefined && props.commentsCount !== 0 && (
        <div className="absolute top-1 left-1 flex items-center space-x-1 rounded-xl bg-zinc-800 bg-opacity-50 p-1 px-2">
          <MessageCircleIcon className="size-3 text-white" />
          <div className="font-bold text-white text-xs">
            {props.commentsCount + 1}
          </div>
        </div>
      )}

      <div
        className={cn(
          "absolute z-10",
          props.commentsCount !== undefined && props.commentsCount !== 0
            ? "right-1"
            : "left-1",
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
