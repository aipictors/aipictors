type Props = {
  position: "top" | "bottom" | "left" | "right"
  children: React.ReactNode
}

/**
 * 画面に固定表示するコンテンツ
 * @param props
 * @returns
 */
export const AppFixedContent = (props: Props) => {
  /**
   * 位置に関するクラス名を取得する
   * @returns クラス名
   */
  const positionClassName = () => {
    if (props.position === "top") {
      return "top-0 left-0"
    }
    if (props.position === "bottom") {
      return "bottom-0 left-0"
    }
    if (props.position === "left") {
      return "top-0 left-0"
    }
    return "top-0 right-0"
  }

  return (
    <div
      className={`fixed p-2 w-full h-auto bg-card shadow-md z-50 ${positionClassName()}`}
    >
      {props.children}
    </div>
  )
}
