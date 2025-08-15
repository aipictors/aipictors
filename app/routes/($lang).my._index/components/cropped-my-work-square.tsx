import { Images } from "lucide-react"
import { useState } from "react"
import { cn } from "~/lib/utils"

type Props = {
  workId: string
  imageUrl: string
  thumbnailImagePosition: number
  size: "xs" | "sm" | "md" | "lg" | "auto"
  imageWidth: number
  imageHeight: number
  ranking?: number
  subWorksCount?: number
}

/**
 * 四角形で作品をクロップして表示するコンポーネント
 */
export function CroppedMyWorkSquare(props: Props) {
  const [isHovered, setIsHovered] = useState(false)

  /**
   * 適切なクロップスタイルを計算する
   * 四角形コンテナに対して画像をクロップして表示
   */
  const getCropStyle = (
    imageWidth: number,
    imageHeight: number,
    thumbnailPosition: number,
  ) => {
    const aspectRatio = imageWidth / imageHeight

    if (aspectRatio > 1) {
      // 横長画像: 高さを100%にして、横方向でクロップ
      const scale = 1.05 // 若干拡大してクロップ領域を確保
      const translateX =
        thumbnailPosition || -((aspectRatio - 1) / (2 * aspectRatio)) * 100

      return {
        width: "auto",
        height: "100%",
        transform: `translateX(${translateX}%) scale(${scale})`,
        minWidth: "100%",
        objectFit: "cover" as const,
      }
    }

    if (aspectRatio < 1) {
      // 縦長画像: 幅を100%にして、縦方向でクロップ
      const scale = 1.05
      const translateY = thumbnailPosition || -((1 - aspectRatio) * 50)

      return {
        width: "100%",
        height: "auto",
        transform: `translateY(${translateY}%) scale(${scale})`,
        minHeight: "100%",
        objectFit: "cover" as const,
      }
    }

    // 正方形画像: そのまま表示
    return {
      width: "100%",
      height: "100%",
      transform: "scale(1.05)",
      objectFit: "cover" as const,
    }
  }

  const cropStyle = getCropStyle(
    props.imageWidth,
    props.imageHeight,
    props.thumbnailImagePosition,
  )

  const backgroundColor = () => {
    if (props.ranking === 1) return "#d6ba49"
    if (props.ranking === 2) return "#858585"
    if (props.ranking === 3) return "#c8a17e"
    return "#00000052"
  }

  return (
    <div className="inline-box relative">
      <div className="transition-all duration-300 ease-in-out">
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn("relative overflow-hidden rounded", {
            "w-full": props.size === "auto",
            "size-16": props.size === "xs",
            "size-20": props.size === "sm",
            "size-32": props.size === "md",
            "size-40": props.size === "lg",
          })}
        >
          <img
            src={props.imageUrl}
            alt=""
            key={props.imageUrl}
            style={{
              ...cropStyle,
              transform: `${cropStyle.transform} ${isHovered ? "scale(1.05)" : "scale(1)"}`,
            }}
            className="max-w-none rounded transition-transform duration-300 ease-in-out"
          />
        </div>
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
      </div>
    </div>
  )
}
