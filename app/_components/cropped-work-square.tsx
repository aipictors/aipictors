type Props = {
  workId: string
  imageUrl: string
  thumbnailImagePosition: number
  size: "sm" | "md" | "lg"
  imageWidth: number
  imageHeight: number
  ranking?: number
}

/**
 * 四角形で作品をクロップして表示するコンポーネント
 */
export const CroppedWorkSquare = (props: Props) => {
  const isLandscape = props.imageWidth > props.imageHeight

  // transform: matrix(1, 0, 0, 1, 0, -9.59896);
  const transform = isLandscape
    ? `matrix(1, 0, 0, 1, 0, ${props.thumbnailImagePosition} 0)`
    : `matrix(1, 0, 0, 1, 0, ${props.thumbnailImagePosition})`

  const size = () => {
    if (props.size === "sm") {
      return isLandscape ? "h-20 w-auto" : "h-auto w-20"
    }
    if (props.size === "md") {
      return isLandscape ? "h-32 w-auto" : "h-auto w-32"
    }

    return isLandscape ? "h-40 w-auto" : "h-auto w-40"
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

  // 16進数で背景を取得する
  const backgroundColor = () => {
    // 1位は金色16進数
    if (props.ranking === 1) {
      return "#d6ba49"
    }
    // 2位は銀色16進数
    if (props.ranking === 2) {
      return "#858585"
    }
    // 3位は銅色16進数
    if (props.ranking === 3) {
      return "#c8a17e"
    }
    // それ以外は透明
    return "#00000052"
  }

  return (
    <a
      href={`/works/${props.workId}`}
      className="relative transition-all duration-300 ease-in-out hover:opacity-80"
    >
      <div
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
        className={`rounded ${wrapSize()} overflow-hidden relative`}
      >
        <img
          src={props.imageUrl}
          alt=""
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
    </a>
  )
}
