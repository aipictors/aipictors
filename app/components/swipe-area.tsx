import { useCallback, useState } from "react"

type Props = {
  onPrev: () => void
  onNext: () => void
  children: React.ReactNode
}

/**
 * スワイプエリア
 * childrenで指定された領域についてスマホ、PCでスワイプ操作可能にする
 */
export function SwipeArea (props: Props): React.ReactNode {
  const [startPosition, setStartPosition] = useState<number | null>(null)

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0]
      setStartPosition(touch.clientX)
    },
    [],
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (startPosition == null) return

      const touch = e.changedTouches[0]
      const endPosition = touch.clientX
      const distance = endPosition - startPosition

      if (distance > 50) {
        props.onPrev()
      } else if (distance < -50) {
        props.onNext()
      }

      setStartPosition(null)
    },
    [props.onPrev, props.onNext, startPosition],
  )

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setStartPosition(e.clientX)
  }, [])

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (startPosition == null) return

      const endPosition = e.clientX
      const distance = endPosition - startPosition

      if (distance > 50) {
        props.onPrev()
      } else if (distance < -50) {
        props.onNext()
      }

      setStartPosition(null)
    },
    [props.onPrev, props.onNext, startPosition],
  )

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{ touchAction: "none" }} // Prevents scrolling during swipe on touch devices
    >
      {props.children}
    </div>
  )
}
