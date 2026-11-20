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
export function SwipeArea(props: Props): React.ReactNode {
  const [startPosition, setStartPosition] = useState<number | null>(null)
  const [startVerticalPosition, setStartVerticalPosition] = useState<
    number | null
  >(null)

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0]
      setStartPosition(touch.clientX)
      setStartVerticalPosition(touch.clientY)
    },
    [],
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (startPosition == null) return

      const touch = e.changedTouches[0]
      const endPosition = touch.clientX
      const distance = endPosition - startPosition
      const verticalDistance =
        startVerticalPosition == null
          ? 0
          : touch.clientY - startVerticalPosition

      // 縦に動かしたときは前後に移らない（スクロールのつもりで画像が切り替わるのを防ぐ）
      if (Math.abs(distance) > Math.abs(verticalDistance)) {
        if (distance > 50) {
          props.onPrev()
        } else if (distance < -50) {
          props.onNext()
        }
      }

      setStartPosition(null)
      setStartVerticalPosition(null)
    },
    [props.onPrev, props.onNext, startPosition, startVerticalPosition],
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
      // 画像の上でも縦スクロールできるようにする（none にすると画像の部分で指が止まる）
      style={{ touchAction: "pan-y" }}
    >
      {props.children}
    </div>
  )
}
