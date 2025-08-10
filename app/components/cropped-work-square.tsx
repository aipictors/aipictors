import { Link } from "@remix-run/react"
import { Images, MessageCircleIcon } from "lucide-react"
import { useState } from "react"
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
            "size-16": props.size === "xs",
            "size-20": props.size === "sm",
            "size-32": props.size === "md",
            "size-40": props.size === "lg",
          })}
        >
          <div
            style={{
              transform: `${transform} ${isHovered ? "scale(1.05)" : "scale(1)"}`,
            }}
          >
            <OptimizedImage
              src={props.imageUrl}
              alt=""
              key={props.imageUrl}
              loading="lazy"
              width={props.imageWidth}
              height={props.imageHeight}
              className={cn(
                "max-w-none rounded transition-transform duration-300 ease-in-out",
                {
                  "h-auto w-full": props.size === "auto",
                  "h-20 w-auto":
                    props.size === "sm" && props.imageWidth > props.imageHeight,
                  "h-auto w-20":
                    props.size === "sm" &&
                    props.imageWidth <= props.imageHeight,
                  "h-32 w-auto":
                    props.size === "md" && props.imageWidth > props.imageHeight,
                  "h-auto w-32":
                    props.size === "md" &&
                    props.imageWidth <= props.imageHeight,
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
            />
          </div>
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
        {props.commentsCount !== undefined && props.commentsCount !== 0 && (
          <div className="absolute top-1 left-1 flex items-center space-x-1 rounded-xl bg-zinc-800 bg-opacity-50 p-1 px-2">
            <MessageCircleIcon className="size-3 text-white" />
            <div className="font-bold text-white text-xs">
              {props.commentsCount + 1}
            </div>
          </div>
        )}
        {/* プロンプト公開・動画バッジ */}
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
      </Link>
    </div>
  )
}
