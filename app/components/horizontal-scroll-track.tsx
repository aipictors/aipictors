import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type Props = {
  children: React.ReactNode
  /** 横に並ぶ部分（ol）のクラス */
  className?: string
}

/** これより動かしたらドラッグとみなす（押しただけのクリックと区別する） */
const DRAG_THRESHOLD_PX = 5

/** 端からこれ以内なら端にいるとみなす（スナップで列の余白の分だけずれるため） */
const END_MARGIN_PX = 8

/**
 * 横に並ぶ列。スクロールバーが出ない環境でもマウスで動かせるように、
 * PC ではドラッグと左右のボタンでも動かせる（タッチはそのまま指で動かす）
 */
export function HorizontalScrollTrack(props: Props) {
  const t = useTranslation()
  const trackRef = useRef<HTMLOListElement>(null)
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startScrollLeft: number
    isDragging: boolean
  } | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const track = trackRef.current
    if (track === null) return
    const update = () => {
      setCanScrollLeft(track.scrollLeft > END_MARGIN_PX)
      setCanScrollRight(
        track.scrollLeft + track.clientWidth <
          track.scrollWidth - END_MARGIN_PX,
      )
    }
    update()
    track.addEventListener("scroll", update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(track)
    return () => {
      track.removeEventListener("scroll", update)
      observer.disconnect()
    }
  }, [])

  const scrollByPage = (direction: -1 | 1) => {
    const track = trackRef.current
    if (track === null) return
    track.scrollBy({
      left: direction * track.clientWidth * 0.8,
      behavior: "smooth",
    })
  }

  const onPointerDown = (event: React.PointerEvent<HTMLOListElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: event.currentTarget.scrollLeft,
      isDragging: false,
    }
  }

  const onPointerMove = (event: React.PointerEvent<HTMLOListElement>) => {
    const drag = dragRef.current
    if (drag === null || drag.pointerId !== event.pointerId) return
    const distance = event.clientX - drag.startX
    if (!drag.isDragging) {
      if (Math.abs(distance) < DRAG_THRESHOLD_PX) return
      drag.isDragging = true
      setIsDragging(true)
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    event.currentTarget.scrollLeft = drag.startScrollLeft - distance
  }

  const endDrag = (event: React.PointerEvent<HTMLOListElement>) => {
    const drag = dragRef.current
    if (drag === null || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    if (!drag.isDragging) return
    setIsDragging(false)
    // ドラッグの終わりの click で、離した場所のバッジを開かない
    const track = event.currentTarget
    const cancelClick = (clickEvent: MouseEvent) => {
      clickEvent.stopPropagation()
      clickEvent.preventDefault()
    }
    track.addEventListener("click", cancelClick, { capture: true, once: true })
    setTimeout(() => track.removeEventListener("click", cancelClick, true), 0)
  }

  const arrowClassName =
    "-translate-y-1/2 absolute top-[42px] z-10 hidden size-9 items-center justify-center rounded-full border bg-background/95 text-foreground shadow-md transition hover:bg-muted active:scale-95 md:flex"

  return (
    <div className="relative">
      <ol
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDragStart={(event) => event.preventDefault()}
        className={cn(
          props.className,
          canScrollLeft || canScrollRight ? "md:cursor-grab" : "",
          // ドラッグ中はスナップで引き戻されないようにする
          isDragging ? "select-none md:cursor-grabbing" : "snap-x",
        )}
      >
        {props.children}
      </ol>
      {canScrollLeft && (
        <button
          type="button"
          aria-label={t("前へ", "Previous")}
          onClick={() => scrollByPage(-1)}
          className={cn(arrowClassName, "-left-3")}
        >
          <ChevronLeftIcon className="size-5" />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          aria-label={t("次へ", "Next")}
          onClick={() => scrollByPage(1)}
          className={cn(arrowClassName, "-right-3")}
        >
          <ChevronRightIcon className="size-5" />
        </button>
      )}
    </div>
  )
}
