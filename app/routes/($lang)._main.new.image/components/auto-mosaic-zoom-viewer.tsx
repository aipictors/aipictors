import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MaximizeIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  clampZoomView,
  INITIAL_ZOOM_VIEW,
  MAX_ZOOM_SCALE,
  toSwipeDirection,
  type ZoomView,
  zoomViewAt,
} from "~/routes/($lang)._main.new.image/utils/zoom-view"

type Props = {
  previews: string[]
  index: number
  onIndexChange: (index: number) => void
  /** 一覧に戻る */
  onBack: () => void
  /** 戻って直す */
  onFix: () => void
  /** このまま投稿する */
  onConfirm: () => void
}

type Point = { x: number; y: number }

type Gesture = {
  startPoint: Point
  startView: ZoomView
  startTime: number
  isMoved: boolean
  /** ピンチ中（2 本指）。離したあとにスワイプやタップとして扱わない */
  isMulti: boolean
  pinch?: { distance: number; midpoint: Point }
}

/** ダブルタップ・ダブルクリックで拡大する倍率 */
const DOUBLE_TAP_SCALE = 3

const TAP_MOVE_LIMIT = 8

const DOUBLE_TAP_MS = 300

/**
 * 自動でかけたモザイクを拡大して確かめる（確認ダイアログの中で全画面に広げて使う）
 * - スマホ: 2 本指で拡大、ドラッグで移動、ダブルタップで拡大・戻す、等倍で左右にスワイプして切り替え
 * - PC: ホイールで拡大、ドラッグで移動、ダブルクリック、← → で切り替え、+ − 0 で拡大・縮小・全体
 */
export function AutoMosaicZoomViewer(props: Props) {
  const t = useTranslation()
  const [view, setView] = useState<ZoomView>(INITIAL_ZOOM_VIEW)
  const [isGesturing, setIsGesturing] = useState(false)
  const viewRef = useRef(view)
  viewRef.current = view
  const frameRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const pointersRef = useRef(new Map<number, Point>())
  const gestureRef = useRef<Gesture | null>(null)
  const lastTapRef = useRef<{ time: number; point: Point } | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const count = props.previews.length
  const hasMultiple = count > 1
  const preview = props.previews[props.index] ?? props.previews[0]

  // 開いたらキーボード（← → + − 0）が効くようにする
  useEffect(() => {
    rootRef.current?.focus()
  }, [])

  // 画像を切り替えたら全体表示に戻す
  useEffect(() => {
    setView(INITIAL_ZOOM_VIEW)
    lastTapRef.current = null
  }, [props.index])

  const clamp = (next: ZoomView) => {
    const img = imgRef.current
    const frame = frameRef.current
    if (!img || !frame) return next
    return clampZoomView(
      next,
      { width: img.offsetWidth, height: img.offsetHeight },
      { width: frame.clientWidth, height: frame.clientHeight },
    )
  }

  /** 画面の位置を、枠の真ん中を原点にした位置に */
  const toFramePoint = (clientX: number, clientY: number): Point => {
    const rect = frameRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: clientX - rect.left - rect.width / 2,
      y: clientY - rect.top - rect.height / 2,
    }
  }

  const zoomTo = (scale: number, point: Point = { x: 0, y: 0 }) => {
    const next = Math.min(Math.max(scale, 1), MAX_ZOOM_SCALE)
    setView(clamp(zoomViewAt(viewRef.current, next, point)))
  }

  const goTo = (step: number) => {
    if (!hasMultiple) return
    props.onIndexChange((props.index + step + count) % count)
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.target instanceof HTMLElement && e.target.closest("button")) {
      if (e.key === "Enter" || e.key === " ") return
    }
    if (e.key === "ArrowLeft") goTo(-1)
    else if (e.key === "ArrowRight") goTo(1)
    else if (e.key === "+" || e.key === "=") zoomTo(viewRef.current.scale * 1.5)
    else if (e.key === "-") zoomTo(viewRef.current.scale / 1.5)
    else if (e.key === "0") setView(INITIAL_ZOOM_VIEW)
    else return
    e.preventDefault()
  }

  // ホイールは passive で登録されるとページのスクロールを止められないので自分で登録する
  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      // トラックパッドのピンチ（ctrlKey 付き）は細かく届くので強めに効かせる
      const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015))
      zoomTo(viewRef.current.scale * factor, toFramePoint(e.clientX, e.clientY))
    }
    frame.addEventListener("wheel", onWheel, { passive: false })
    return () => frame.removeEventListener("wheel", onWheel)
  }, [])

  const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y) || 1

  const midpoint = (a: Point, b: Point) => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  })

  /** 置いている指の数が変わったら、今の位置から動かし直す */
  const restartGesture = () => {
    const points = [...pointersRef.current.values()]
    const previous = gestureRef.current
    if (points.length === 0) {
      gestureRef.current = null
      return
    }
    gestureRef.current = {
      startPoint: points[0],
      startView: viewRef.current,
      startTime: previous?.startTime ?? Date.now(),
      isMoved: previous?.isMoved ?? false,
      isMulti: previous?.isMulti === true || points.length >= 2,
      pinch:
        points.length >= 2
          ? {
              distance: distance(points[0], points[1]),
              midpoint: midpoint(points[0], points[1]),
            }
          : undefined,
    }
  }

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return
    e.preventDefault()
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // 捕まえられなくても動かせる
    }
    const isFirst = pointersRef.current.size === 0
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (isFirst) gestureRef.current = null
    restartGesture()
    setIsGesturing(true)
  }

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!pointersRef.current.has(e.pointerId)) return
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const gesture = gestureRef.current
    if (!gesture) return
    const points = [...pointersRef.current.values()]

    if (gesture.pinch && points.length >= 2) {
      const scale = Math.min(
        Math.max(
          (gesture.startView.scale * distance(points[0], points[1])) /
            gesture.pinch.distance,
          0.6,
        ),
        MAX_ZOOM_SCALE,
      )
      const start = toFramePoint(
        gesture.pinch.midpoint.x,
        gesture.pinch.midpoint.y,
      )
      const current = midpoint(points[0], points[1])
      const zoomed = zoomViewAt(gesture.startView, scale, start)
      setView({
        scale,
        x: zoomed.x + current.x - gesture.pinch.midpoint.x,
        y: zoomed.y + current.y - gesture.pinch.midpoint.y,
      })
      return
    }

    const deltaX = e.clientX - gesture.startPoint.x
    const deltaY = e.clientY - gesture.startPoint.y
    if (
      Math.abs(deltaX) > TAP_MOVE_LIMIT ||
      Math.abs(deltaY) > TAP_MOVE_LIMIT
    ) {
      gesture.isMoved = true
    }
    // 拡大中は画像を動かす。等倍のときは離したときに左右のスワイプとして扱う
    if (gesture.startView.scale > 1) {
      setView(
        clamp({
          scale: gesture.startView.scale,
          x: gesture.startView.x + deltaX,
          y: gesture.startView.y + deltaY,
        }),
      )
    }
  }

  const handlePointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!pointersRef.current.has(e.pointerId)) return
    pointersRef.current.delete(e.pointerId)
    const gesture = gestureRef.current
    if (pointersRef.current.size > 0) {
      // ピンチの途中で 1 本離したら、残りの指で続けて動かせるようにする
      restartGesture()
      return
    }
    gestureRef.current = null
    setIsGesturing(false)
    setView(clamp(viewRef.current))
    if (!gesture || e.type === "pointercancel" || gesture.isMulti) return

    if (gesture.isMoved) {
      if (gesture.startView.scale <= 1) {
        const direction = toSwipeDirection(
          e.clientX - gesture.startPoint.x,
          e.clientY - gesture.startPoint.y,
        )
        if (direction !== 0) goTo(direction)
      }
      lastTapRef.current = null
      return
    }

    // ダブルタップ・ダブルクリック: 押した所を拡大し、拡大中なら全体に戻す
    const now = Date.now()
    const point = { x: e.clientX, y: e.clientY }
    const last = lastTapRef.current
    if (
      last &&
      now - last.time < DOUBLE_TAP_MS &&
      distance(last.point, point) < 30
    ) {
      lastTapRef.current = null
      if (viewRef.current.scale > 1.01) setView(INITIAL_ZOOM_VIEW)
      else zoomTo(DOUBLE_TAP_SCALE, toFramePoint(point.x, point.y))
      return
    }
    lastTapRef.current = { time: now, point }
  }

  const isZoomed = view.scale > 1.01

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      className="flex min-h-0 flex-1 flex-col bg-black text-white outline-none"
      onKeyDown={handleKeyDown}
    >
      <div className="flex shrink-0 items-center gap-1 px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2">
        <Button
          type="button"
          variant="ghost"
          className="h-11 gap-1 px-3 text-white hover:bg-white/10 hover:text-white"
          onClick={props.onBack}
        >
          <ArrowLeftIcon className="size-5" />
          {t("一覧に戻る", "Back")}
        </Button>
        {hasMultiple && (
          <span className="ml-1 text-sm text-white/80 tabular-nums">
            {props.index + 1} / {count}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 text-white hover:bg-white/10 hover:text-white"
            aria-label={t("縮小", "Zoom out")}
            disabled={!isZoomed}
            onClick={() => zoomTo(view.scale / 1.5)}
          >
            <ZoomOutIcon className="size-5" />
          </Button>
          <span className="hidden w-12 text-center text-white/80 text-xs tabular-nums sm:inline">
            {Math.round(view.scale * 100)}%
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 text-white hover:bg-white/10 hover:text-white"
            aria-label={t("拡大", "Zoom in")}
            disabled={view.scale >= MAX_ZOOM_SCALE}
            onClick={() => zoomTo(view.scale * 1.5)}
          >
            <ZoomInIcon className="size-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 text-white hover:bg-white/10 hover:text-white"
            aria-label={t("全体を表示", "Fit to screen")}
            disabled={!isZoomed}
            onClick={() => setView(INITIAL_ZOOM_VIEW)}
          >
            <MaximizeIcon className="size-5" />
          </Button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={frameRef}
          className={cn(
            "absolute inset-0 flex touch-none select-none items-center justify-center overflow-hidden",
            isZoomed ? "cursor-grab" : "cursor-zoom-in",
            isGesturing && isZoomed && "cursor-grabbing",
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <img
            ref={imgRef}
            src={preview}
            alt={t(
              `${props.index + 1}枚目（拡大表示）`,
              `Image ${props.index + 1} (zoomed)`,
            )}
            draggable={false}
            className={cn(
              "max-h-full max-w-full object-contain will-change-transform",
              !isGesturing && "transition-transform duration-150 ease-out",
            )}
            style={{
              transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`,
            }}
          />
        </div>
        {hasMultiple && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="-translate-y-1/2 absolute top-1/2 left-2 size-12 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
              aria-label={t("前の画像", "Previous image")}
              onClick={() => goTo(-1)}
            >
              <ChevronLeftIcon className="size-7" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="-translate-y-1/2 absolute top-1/2 right-2 size-12 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
              aria-label={t("次の画像", "Next image")}
              onClick={() => goTo(1)}
            >
              <ChevronRightIcon className="size-7" />
            </Button>
          </>
        )}
      </div>

      <div className="shrink-0 space-y-2 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <p className="text-center text-white/70 text-xs">
          <span className="sm:hidden">
            {t(
              "2本指で拡大・ダブルタップで拡大／戻す",
              "Pinch or double-tap to zoom",
            )}
            {hasMultiple &&
              t("・左右にスワイプで切り替え", " · swipe to switch")}
          </span>
          <span className="hidden sm:inline">
            {t(
              "ホイール・ダブルクリックで拡大、ドラッグで移動",
              "Scroll or double-click to zoom, drag to move",
            )}
            {hasMultiple && t("、← → で切り替え", ", ← → to switch")}
          </span>
        </p>
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
          <Button
            type="button"
            variant="secondary"
            className="h-11"
            onClick={props.onFix}
          >
            {t("修正する", "Fix")}
          </Button>
          <Button type="button" className="h-11" onClick={props.onConfirm}>
            {t("このまま投稿する", "Post as is")}
          </Button>
        </div>
      </div>
    </div>
  )
}
