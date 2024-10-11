import { Link } from "react-router"
import { Images } from "lucide-react"
import { useState } from "react"

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
    if (width < height) {
      result = "translateY("
    } else {
      result = "translateX("
    }

    if (src !== undefined && src !== null) {
      result = `${result + src}%`
    } else {
      if (width === height) {
        result = `${result}0%`
      } else {
        result = `${result}-5%`
      }
    }

    result = `${result})`
    return result
  }

  const transform = getThumbnailPos(
    props.thumbnailImagePosition,
    props.imageWidth,
    props.imageHeight,
  )

  const size = () => {
    if (props.size === "auto") {
      return "w-full h-auto"
    }
    if (props.size === "sm") {
      return props.imageWidth > props.imageHeight
        ? "h-20 w-auto"
        : "h-auto w-20"
    }
    if (props.size === "md") {
      return props.imageWidth > props.imageHeight
        ? "h-32 w-auto"
        : "h-auto w-32"
    }

    return props.imageWidth > props.imageHeight ? "h-40 w-auto" : "h-auto w-40"
  }

  const wrapSize = () => {
    if (props.size === "auto") {
      return "w-full"
    }
    if (props.size === "xs") {
      return "h-16 w-16"
    }
    if (props.size === "sm") {
      return "h-20 w-20"
    }
    if (props.size === "md") {
      return "h-32 w-32"
    }

    return "h-40 w-40"
  }

  const backgroundColor = () => {
    if (props.ranking === 1) {
      return "#d6ba49"
    }
    if (props.ranking === 2) {
      return "#858585"
    }
    if (props.ranking === 3) {
      return "#c8a17e"
    }
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
          className={`rounded ${wrapSize()} relative overflow-hidden`}
        >
          <img
            src={props.imageUrl}
            alt=""
            key={props.imageUrl}
            className={`max-w-none rounded ${size()} transition-transform duration-300 ease-in-out`}
            style={{
              transform: `${transform} ${isHovered ? "scale(1.05)" : "scale(1)"}`,
            }}
          />
        </div>
        {props.ranking && (
          <div
            className={
              "absolute bottom-2 left-2 flex h-6 w-6 items-center justify-center rounded-full font-bold text-white text-xs"
            }
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
