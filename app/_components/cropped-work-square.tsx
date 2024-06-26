import { Link } from "@remix-run/react"

type Props = {
  workId: string
  imageUrl: string
  thumbnailImagePosition: number
  size: "sm" | "md" | "lg"
  imageWidth: number
  imageHeight: number
  ranking?: number
  subWorksCount?: number
}

/**
 * 四角形で作品をクロップして表示するコンポーネント
 */
export const CroppedWorkSquare = (props: Props) => {
  const getThumbnailPos = (
    src: number,
    width: number,
    height: number,
  ): string => {
    console.log(props.subWorksCount)

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
    <Link
      to={`/works/${props.workId}`}
      className="relative transition-all duration-300 ease-in-out hover:opacity-80"
    >
      <div
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
        className={`rounded ${wrapSize()} overflow-hidden relative`}
      >
        <img
          src={props.imageUrl}
          alt=""
          key={props.imageUrl}
          // biome-ignore lint/nursery/useSortedClasses: <explanation>
          className={`rounded max-w-none ${size()}`}
          style={{ transform: transform }}
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
        <div
          className={
            "absolute top-0 right-0 flex h-8 w-8 items-center justify-center rounded-tr rounded-bl font-bold text-white text-xs"
          }
          style={{ backgroundColor: "#00000052" }}
        >
          {props.subWorksCount + 1}
        </div>
      )}
    </Link>
  )
}
