import { Link } from "react-router"
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
export function CroppedWorkSquare(props: Props) {
  const [isHovered, setIsHovered] = useState(false)

  const getThumbnailPos = (
    src: number,
    width: number,
    height: number,
  ): string => {
    let result = ""
    result = width < height ? "translateY(" : "translateX("
    result = `${result + (src ?? (width === height ? 0 : -5))}%)`
    return result
  }

  const transform = getThumbnailPos(
    props.thumbnailImagePosition,
    props.imageWidth,
    props.imageHeight,
  )

  const backgroundColor = () => {
    if (props.ranking === 1) return "#d6ba49"
    if (props.ranking === 2) return "#858585"
    if (props.ranking === 3) return "#c8a17e"
    return "#00000052"
  }

  return (
    <div className="inline-box relative">
      <Link
        to={`/posts/${props.workId}`}
        className="transition-all duration-300 ease-in-out"
      >
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn("relative overflow-hidden rounded", {
            "w-full": props.size === "auto",
            "h-16 w-16": props.size === "xs",
            "h-20 w-20": props.size === "sm",
            "h-32 w-32": props.size === "md",
            "h-40 w-40": props.size === "lg",
          })}
        >
          <img
            src={props.imageUrl}
            alt=""
            key={props.imageUrl}
            className={cn(
              "max-w-none rounded transition-transform duration-300 ease-in-out",
              {
                "h-auto w-full": props.size === "auto",
                "h-20 w-auto":
                  props.size === "sm" && props.imageWidth > props.imageHeight,
                "h-auto w-20":
                  props.size === "sm" && props.imageWidth <= props.imageHeight,
                "h-32 w-auto":
                  props.size === "md" && props.imageWidth > props.imageHeight,
                "h-auto w-32":
                  props.size === "md" && props.imageWidth <= props.imageHeight,
                "h-40 w-auto":
                  props.size !== "sm" &&
                  props.size !== "md" &&
                  props.imageWidth > props.imageHeight,
                "h-auto w-40":
                  props.size !== "sm" &&
                  props.size !== "md" &&
                  props.imageWidth <= props.imageHeight,
              },
            )}
            style={{
              transform: `${transform} ${isHovered ? "scale(1.05)" : "scale(1)"}`,
            }}
          />
        </div>
        {props.ranking && (
          <div
            className="absolute bottom-2 left-2 flex h-6 w-6 items-center justify-center rounded-full font-bold text-white text-xs"
            style={{ backgroundColor: backgroundColor() }}
          >
            {props.ranking}
          </div>
        )}
        {props.subWorksCount !== undefined && props.subWorksCount !== 0 && (
          <div className="absolute top-1 right-1 flex items-center space-x-1 rounded-xl bg-zinc-800 bg-opacity-50 p-1 px-2">
            <Images className="h-3 w-3 text-white" />
            <div className="font-bold text-white text-xs">
              {props.subWorksCount + 1}
            </div>
          </div>
        )}
      </Link>
    </div>
  )
}
