import {
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Keyboard,
  Loader2,
  ScrollText,
  XIcon,
} from "lucide-react"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useHydrated } from "remix-utils/use-hydrated"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  toResizedImageSrcSet,
  toResizedImageUrl,
} from "~/utils/resized-image-url"
import {
  readViewerCaptionShown,
  saveViewerCaptionShown,
} from "~/utils/video-playback-preference"
import {
  pickWorkImageSizeHint,
  toWorkImageSizes,
} from "~/utils/work-image-sizes"

type Props = {
  imageURLs: string[]
  thumbnailUrl: string
  currentIndex: number
  setCurrentIndex: (index: number) => void
  mode?: "dialog" | "page" // ダイアログモードかページモードかを指定
  /** 表示中の画像の幅÷高さ。分かれば縮小版を表示する大きさに合わせて選ばせる */
  aspectRatio?: number
  /**
   * 作品の画像（メイン）の元の幅と縦横比。分かれば 1280px より大きい縮小版も候補にする。
   * 複数枚の画像は大きさが分からないので、同じ大きさとみなす（多くは同じ設定で作った画像）
   */
  imageSizeHint?: { width: number; aspectRatio: number }
  /** 画像が届くまで代わりに出すサムネイル（同じ比率のもの） */
  placeholderUrl?: string
  /** 複数枚の作品用。枠の高さを固定し、切り替えてもページが動かないようにする */
  isFixedHeight?: boolean
  /** 拡大表示で画像の横（スマホは下）に並べて読めるキャプション。なければ切り替えも出さない */
  caption?: React.ReactNode
}

/** 読み込み後の展開を待つ上限 */
const STAGE_IMAGE_DECODE_TIMEOUT_MS = 500

export function ImagesPreview(props: Props): React.ReactNode {
  const { mode = "page" } = props
  const t = useTranslation()
  // 拡大表示でキャプションを並べるか（端末に覚える。Discord の要望: 作品を見ながらキャプションを読みたい）
  const [isCaptionShown, setIsCaptionShown] = useState(false)
  const captionPanelRef = useRef<HTMLDivElement>(null)
  const isCaptionPanelOpen = props.caption !== undefined && isCaptionShown
  // 拡大表示のボタン（閉じる・キャプション・前後・枚数）を隠して絵だけにする。画像か背景を押すと戻る
  // （Discord の要望: キャプションの切り替えボタンが絵の上に被る）
  const [isControlsHidden, setIsControlsHidden] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [showKeyboardHint, setShowKeyboardHint] = useState(true)
  const imgRef = useRef<HTMLImageElement>(null)
  const mainImgRef = useRef<HTMLImageElement>(null)
  // 画像の読み込みが終わるまで表示領域を確保し、読み込み後のレイアウトシフトを防ぐ
  const [isMainImageLoaded, setIsMainImageLoaded] = useState(false)
  // 縮小版がまだ無い画像は 404 → 縮小の Worker に切り替わって届くまで数秒かかり、その間
  // リンク切れの印が一瞬出たあと大きい枠が空のまま（下の小さいサムネイルだけ）になっていた。
  // 届くまでは同じ絵の小さい版を枠いっぱいに出し、画面の移動で後から出す画像は隠しておく。
  // サーバーの HTML に入れた画像は JS より先に読み始めているので隠さない（小さい版はその下に敷く）
  const isHydrated = useHydrated()
  const [serverRenderedUrl] = useState(() =>
    isHydrated ? null : props.thumbnailUrl,
  )
  const startCoord = useRef({ x: 0, y: 0 })
  const prevTranslate = useRef({ x: 0, y: 0 })
  const lastTap = useRef(0)
  const dragMovedRef = useRef(false)
  const dragStartedRef = useRef(false)

  useEffect(() => {
    // SSR した画像はハイドレーション前に読み込み済みのことがある
    const image =
      mainImgRef.current ??
      stageRef.current?.querySelector<HTMLImageElement>(
        `img[data-stage-url="${CSS.escape(props.thumbnailUrl)}"]`,
      )
    setIsMainImageLoaded(image?.complete === true)
  }, [props.thumbnailUrl])

  const openPreview = () => {
    setIsOpen(true)
    setTranslate({ x: 0, y: 0 })
    setScale(1)
    setIsDragging(false)
    dragMovedRef.current = false
    dragStartedRef.current = false
    startCoord.current = { x: 0, y: 0 }
    prevTranslate.current = { x: 0, y: 0 }
    setShowKeyboardHint(true)
    setIsCaptionShown(readViewerCaptionShown())
    setIsControlsHidden(false)
    props.setCurrentIndex(props.imageURLs.indexOf(props.thumbnailUrl))
  }

  const closePreview = () => {
    setIsOpen(false)
    setScale(1)
    setTranslate({ x: 0, y: 0 })
    setIsDragging(false)
    dragMovedRef.current = false
    dragStartedRef.current = false
    startCoord.current = { x: 0, y: 0 }
    prevTranslate.current = { x: 0, y: 0 }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    // Windows のブラウザ戻る/進む（Alt+←/Alt+→）はブラウザ側に任せる
    if (
      (e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) ||
      e.key === "BrowserBack" ||
      e.key === "BrowserForward"
    ) {
      return
    }

    // 入力欄にフォーカスしている場合はショートカットキーを無効化
    const activeElement = document.activeElement
    const tagName = activeElement?.tagName.toLowerCase()
    const isInputFocused =
      tagName === "input" ||
      tagName === "textarea" ||
      activeElement?.getAttribute("contenteditable") === "true" ||
      activeElement?.getAttribute("role") === "textbox"

    // モードに応じて対応するキーを決定
    const supportedKeys = ["arrowleft", "arrowright", "a", "d"]

    if (!isOpen) {
      if (supportedKeys.includes(e.key.toLowerCase()) && !isInputFocused) {
        e.preventDefault()
      } else {
        return
      }
    }

    // 入力欄にフォーカスしている場合は処理を停止
    if (isInputFocused) {
      return
    }

    if (
      ["a", "d"].includes(e.key.toLowerCase()) ||
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
    ) {
      e.preventDefault()
    }

    if (e.key === "Escape") closePreview()

    // ダイアログモードの場合はADキーのみ、ページモードは矢印キー + ADキー
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") prevImage()
    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") nextImage()

    if (e.key === "ArrowUp") increaseScale()
    if (e.key === "ArrowDown") decreaseScale()
  }

  const nextImage = () => {
    setShowKeyboardHint(false)
    if (props.currentIndex < props.imageURLs.length - 1) {
      props.setCurrentIndex(props.currentIndex + 1)
    } else {
      // Loop back to the first image
      props.setCurrentIndex(0)
    }
  }

  const prevImage = () => {
    setShowKeyboardHint(false)
    if (props.currentIndex > 0) {
      props.setCurrentIndex(props.currentIndex - 1)
    } else {
      // Loop back to the last image
      props.setCurrentIndex(props.imageURLs.length - 1)
    }
  }

  const increaseScale = () => {
    setScale((prevScale) => Math.min(prevScale * 1.1, 4))
  }

  const decreaseScale = () => {
    setScale((prevScale) => Math.max(prevScale * 0.9, 0.1))
  }

  const handleDoubleClick = () => {
    setScale((prevScale) => (prevScale === 1 ? 2 : 1))
    setTranslate({ x: 0, y: 0 })
  }

  const handleDoubleTap = (e: React.TouchEvent<HTMLImageElement>) => {
    const currentTime = Date.now()
    const tapLength = currentTime - lastTap.current

    // ダブルタップの間隔を少し広げ、誤検知を防ぐ
    if (tapLength < 300 && tapLength > 50) {
      e.preventDefault()
      handleDoubleClick()
    }

    // 最後のタップ時間を更新
    lastTap.current = currentTime
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    dragMovedRef.current = false
    if (scale !== 1) {
      dragStartedRef.current = true
      setIsDragging(true)
      startCoord.current = { x: e.clientX, y: e.clientY }
      prevTranslate.current = { ...translate }
    } else {
      dragStartedRef.current = false
      startCoord.current = { x: e.clientX, y: e.clientY }
      prevTranslate.current = { ...translate }
    }
  }

  const handleMouseUp: React.MouseEventHandler<HTMLImageElement> = (e) => {
    if (isDragging) {
      setIsDragging(false)
      dragStartedRef.current = false
    } else {
      const deltaX = e.clientX - startCoord.current.x
      const swipeDistance = Math.abs(deltaX)

      if (swipeDistance > 50) {
        // Adjust threshold as needed
        if (deltaX < 0) {
          nextImage()
        } else {
          prevImage()
        }
      } else if (isControlsHidden) {
        setIsControlsHidden(false)
      } else {
        openPreview()
      }

      // Reset translation
      setTranslate({ x: 0, y: 0 })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && imgRef.current) {
      const deltaX = e.clientX - startCoord.current.x
      const deltaY = e.clientY - startCoord.current.y
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        dragMovedRef.current = true
      }
      setTranslate({
        x: prevTranslate.current.x + deltaX,
        y: prevTranslate.current.y + deltaY,
      })
    }
  }

  const handleTouchStart: React.TouchEventHandler<HTMLImageElement> = (e) => {
    dragMovedRef.current = false
    if (scale !== 1) {
      setIsDragging(true) // ドラッグ開始
    }
    startCoord.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    prevTranslate.current = { ...translate }
  }

  const handleTouchMove: React.TouchEventHandler<HTMLImageElement> = (e) => {
    e.preventDefault() // タッチスクロールのデフォルト動作を無効化

    if (isDragging) {
      const deltaX = e.touches[0].clientX - startCoord.current.x
      const deltaY = e.touches[0].clientY - startCoord.current.y
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        dragMovedRef.current = true
      }
      setTranslate({
        x: prevTranslate.current.x + deltaX,
        y: prevTranslate.current.y + deltaY,
      })
    }
  }

  const handleTouchEnd: React.TouchEventHandler<HTMLImageElement> = (e) => {
    if (isDragging && e.changedTouches.length === 1 && scale === 1) {
      setIsDragging(false) // ドラッグ終了
      const deltaX = e.changedTouches[0].clientX - startCoord.current.x
      const swipeDistance = Math.abs(deltaX)

      if (swipeDistance > 50) {
        if (deltaX < 0) {
          nextImage()
        } else {
          prevImage()
        }
      }

      setTranslate({ x: 0, y: 0 })
    } else {
      if (!isDragging) {
        const deltaX = e.changedTouches[0].clientX - startCoord.current.x
        const swipeDistance = Math.abs(deltaX)

        if (swipeDistance > 50) {
          if (deltaX < 0) {
            nextImage()
          } else {
            prevImage()
          }
        } else if (isControlsHidden) {
          setIsControlsHidden(false)
        }
      }
    }
  }

  const toggleCaption = () => {
    const next = !isCaptionShown
    setIsCaptionShown(next)
    saveViewerCaptionShown(next)
  }

  const handleWheel = (e: WheelEvent) => {
    // キャプションの欄はスクロールで読めるようにする（拡大縮小しない）
    if (
      e.target instanceof Node &&
      captionPanelRef.current?.contains(e.target)
    ) {
      return
    }
    e.preventDefault()
    const scaleAmount = e.deltaY > 0 ? 0.9 : 1.1
    setScale((prevScale) => Math.min(Math.max(0.1, prevScale * scaleAmount), 4))
  }

  const adjustImageSize = () => {
    if (imgRef.current) {
      const img = imgRef.current
      const aspectRatio = img.naturalWidth / img.naturalHeight
      const screenAspectRatio = window.innerWidth / window.innerHeight

      if (aspectRatio > screenAspectRatio) {
        img.style.width = "100vw"
        img.style.height = "auto"
      } else {
        img.style.width = "auto"
        img.style.height = "100vh"
      }
    }
  }

  // 枠に出す画像は重ねておき、読み込みと展開が終わったものの表示を切り替えるだけにする。
  // 1 枚の src を変えると、読み込み中に消えたり画像の大きさに合わせて伸び縮みしたりする
  const [stageReadyUrls, setStageReadyUrls] = useState(
    () => new Set(serverRenderedUrl === null ? [] : [serverRenderedUrl]),
  )
  const [stageVisitedUrls, setStageVisitedUrls] = useState(
    () => new Set([props.thumbnailUrl]),
  )
  if (props.isFixedHeight && !stageVisitedUrls.has(props.thumbnailUrl)) {
    setStageVisitedUrls(new Set(stageVisitedUrls).add(props.thumbnailUrl))
  }
  const shownStageUrlRef = useRef(props.thumbnailUrl)
  if (stageReadyUrls.has(props.thumbnailUrl)) {
    shownStageUrlRef.current = props.thumbnailUrl
  }
  const shownStageUrl = shownStageUrlRef.current
  const isShownStageImageReady = stageReadyUrls.has(shownStageUrl)
  const isStageImagePending =
    shownStageUrl !== props.thumbnailUrl || !isShownStageImageReady
  const isStagePreviewShown =
    !isShownStageImageReady ||
    (shownStageUrl === props.thumbnailUrl && !isMainImageLoaded)

  // 元の幅が分かれば、パソコンの大きな画面向けに 1920・2560px の縮小版も候補にする
  const toSrcSetOptions = (hint: Props["imageSizeHint"]) =>
    hint && hint.width > 0
      ? { minWidth: 400, maxWidth: hint.width, large: true }
      : { minWidth: 400 }
  const mainImageSrcSetOptions = toSrcSetOptions(props.imageSizeHint)

  // 大きい画像が届くまで枠いっぱいに出す小さい版。一覧で押したサムネイルが無ければ、
  // 下のサムネイルの列と同じ縮小版（すぐ届く・同じ URL なので 1 回の通信で済む）。
  // 読み込み中・Worker に切り替え中の大きい画像は alt を空にして、リンク切れの印を出さない
  const previewUrl =
    props.placeholderUrl ?? toResizedImageUrl(props.thumbnailUrl, 160)
  const previewImage =
    previewUrl && previewUrl !== props.thumbnailUrl ? (
      <img
        aria-hidden
        alt=""
        src={previewUrl}
        draggable={false}
        className="pointer-events-none absolute inset-0 size-full object-contain"
      />
    ) : null
  const isMainImageHidden =
    !isMainImageLoaded && props.thumbnailUrl !== serverRenderedUrl

  // 今の画像のほか、次の画像を先に読む（押したときにすぐ出せるように）。
  // 開いただけで全部読むと、モバイルで最初の表示より先に何 MB も通信する
  const stageUrls = [...stageVisitedUrls]
  for (const offset of stageVisitedUrls.size > 1 ? [1, -1, 2] : [1]) {
    const url =
      props.imageURLs[
        (props.currentIndex + offset + props.imageURLs.length * 2) %
          props.imageURLs.length
      ]
    if (url && !stageVisitedUrls.has(url)) stageUrls.push(url)
  }

  const markStageImageReady = (url: string) => {
    setStageReadyUrls((current) =>
      current.has(url) ? current : new Set(current).add(url),
    )
  }

  /** 展開が終わったら表示できる印を付ける。展開の完了が来ないブラウザでも切り替えが止まらないよう待ち時間に上限を置く */
  const markStageImageReadyAfterDecode = (
    image: HTMLImageElement,
    url: string,
  ) => {
    const done = () => markStageImageReady(url)
    image.decode().then(done, done)
    setTimeout(done, STAGE_IMAGE_DECODE_TIMEOUT_MS)
  }

  // サーバーの HTML に入っている画像は hydration の前に読み終わることがあり、そのときは
  // onLoad が呼ばれない（押しても画像が変わらなくなる）ので、読み終わっているものをここで拾う
  const stageRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const images =
      stageRef.current?.querySelectorAll<HTMLImageElement>(
        "img[data-stage-url]",
      ) ?? []
    for (const image of images) {
      const url = image.dataset.stageUrl
      if (url && image.complete && !stageReadyUrls.has(url)) {
        markStageImageReadyAfterDecode(image, url)
      }
    }
  }, [stageUrls.length])

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [props.currentIndex, isOpen])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("wheel", handleWheel, { passive: false })
    } else {
      document.removeEventListener("wheel", handleWheel)
    }
    return () => {
      document.removeEventListener("wheel", handleWheel)
    }
  }, [isOpen, scale])

  useEffect(() => {
    if (isOpen && imgRef.current) {
      adjustImageSize()
    }
  }, [isOpen, props.currentIndex])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) {
        return
      }

      const deltaX = e.clientX - startCoord.current.x
      const deltaY = e.clientY - startCoord.current.y

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        dragMovedRef.current = true
      }

      setTranslate({
        x: prevTranslate.current.x + deltaX,
        y: prevTranslate.current.y + deltaY,
      })
    }

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
      }
    }

    window.addEventListener("mousemove", handleGlobalMouseMove)
    window.addEventListener("mouseup", handleGlobalMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove)
      window.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [isOpen, isDragging])

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      if (isDragging || dragMovedRef.current || dragStartedRef.current) {
        setIsDragging(false)
        dragMovedRef.current = false
        dragStartedRef.current = false
        return
      }
      // ボタンを隠しているときは、閉じずにボタンを戻す
      if (isControlsHidden) {
        setIsControlsHidden(false)
        return
      }
      closePreview()
    }
  }

  const handleMainTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const deltaX = e.changedTouches[0].clientX - startCoord.current.x
    const _deltaY = e.changedTouches[0].clientY - startCoord.current.y
    const swipeDistance = Math.abs(deltaX)

    if (swipeDistance > 50) {
      // Adjust threshold as needed
      if (deltaX < 0) {
        nextImage()
      } else {
        prevImage()
      }
    }

    // Reset translation
    setTranslate({ x: 0, y: 0 })
  }

  const handleMainTouchStart: React.TouchEventHandler<HTMLImageElement> = (
    e,
  ) => {
    dragMovedRef.current = false
    startCoord.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
    prevTranslate.current = { ...translate }
  }

  const handleMainMouseDown = (e: React.MouseEvent) => {
    dragMovedRef.current = false
    startCoord.current = { x: e.clientX, y: e.clientY }
    prevTranslate.current = { ...translate }
  }

  const handleMainMouseUp: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const deltaX = e.clientX - startCoord.current.x
    const swipeDistance = Math.abs(deltaX)

    if (swipeDistance > 50) {
      // Adjust threshold as needed
      if (deltaX < 0) {
        nextImage()
      } else {
        prevImage()
      }
    } else {
      openPreview()
    }

    // Reset translation
    setTranslate({ x: 0, y: 0 })
  }

  const previewOverlay = isOpen ? (
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard navigation required
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black/90"
      onClick={handleBackgroundClick}
    >
      {!isControlsHidden && (
        <div className="absolute top-4 right-4 z-10 flex flex-row-reverse items-center gap-2">
          <Button onClick={closePreview} size={"icon"}>
            <XIcon />
          </Button>
          {props.caption !== undefined && (
            <Button
              className="gap-1.5"
              onClick={toggleCaption}
              aria-pressed={isCaptionShown}
              variant={isCaptionShown ? "default" : "secondary"}
            >
              <ScrollText className="size-4" />
              {isCaptionShown
                ? t("キャプションを隠す", "Hide caption")
                : t("キャプション", "Caption")}
            </Button>
          )}
          <Button
            variant="secondary"
            size={"icon"}
            onClick={() => setIsControlsHidden(true)}
            aria-label={t(
              "ボタンを隠す（画像を押すと戻ります）",
              "Hide buttons (tap the image to show them again)",
            )}
            title={t(
              "ボタンを隠す（画像を押すと戻ります）",
              "Hide buttons (tap the image to show them again)",
            )}
          >
            <EyeOff className="size-4" />
          </Button>
        </div>
      )}
      {isCaptionPanelOpen && (
        <div
          ref={captionPanelRef}
          className={cn(
            "absolute inset-x-0 bottom-0 max-h-[38vh] overflow-y-auto whitespace-pre-wrap break-words bg-black/80 px-5 pt-4 pb-16 text-sm text-white leading-relaxed md:inset-x-auto md:top-0 md:right-0 md:max-h-none md:w-80 md:pt-20 md:pb-6",
            // ボタンを隠しているときは、ボタンの分の余白を詰める
            isControlsHidden && "pb-4 md:pt-6",
          )}
        >
          {props.caption}
        </div>
      )}
      <img
        ref={imgRef}
        src={props.imageURLs[props.currentIndex]}
        alt={`image-${props.currentIndex}`}
        className={cn(
          "max-h-[92vh] max-w-[92vw] cursor-pointer object-contain",
          // キャプションと重ならないよう、スマホは上に、パソコンは左に寄せる
          isCaptionPanelOpen &&
            "mb-[38vh] max-h-[54vh] md:mr-80 md:mb-0 md:max-h-[92vh] md:max-w-[calc(92vw-20rem)]",
        )}
        style={{
          transform: `scale(${scale}) translate(${translate.x}px, ${translate.y}px)`,
          transition: isDragging ? "none" : "transform 0.1s ease-out",
          userSelect: "none",
        }}
        draggable={false}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchEndCapture={handleDoubleTap}
      />
      {props.imageURLs.length > 1 && !isControlsHidden && (
        <>
          {showKeyboardHint && (
            <div className="absolute top-6 left-6 hidden items-center gap-2 rounded-lg bg-black/60 px-3 py-2 text-white backdrop-blur-sm md:flex">
              <Keyboard className="h-4 w-4" />
              <div className="flex items-center gap-1 text-xs">
                {mode === "dialog" ? (
                  <>
                    <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-xs">
                      A
                    </kbd>
                    <span className="mx-1">•</span>
                    <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-xs">
                      D
                    </kbd>
                  </>
                ) : (
                  <>
                    <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-xs">
                      A
                    </kbd>
                    <span>/</span>
                    <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-xs">
                      ←
                    </kbd>
                    <span className="mx-1">•</span>
                    <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-xs">
                      D
                    </kbd>
                    <span>/</span>
                    <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-xs">
                      →
                    </kbd>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="absolute bottom-4 flex w-full items-center justify-center">
            <Button
              className="mr-4 transform rounded-full"
              size={"icon"}
              onClick={prevImage}
              disabled={!(props.currentIndex > 0)}
            >
              <ChevronLeft />
            </Button>
            <Button
              className="ml-4 transform rounded-full"
              size={"icon"}
              onClick={nextImage}
              disabled={!(props.currentIndex < props.imageURLs.length - 1)}
            >
              <ChevronRight />
            </Button>
          </div>

          <div
            className={cn(
              "absolute right-6 bottom-6 text-right text-sm text-white",
              isCaptionPanelOpen && "md:right-[21.5rem]",
            )}
          >
            {props.currentIndex + 1}/{props.imageURLs.length}
          </div>
        </>
      )}
    </div>
  ) : null

  if (props.isFixedHeight) {
    return (
      <>
        <div
          ref={stageRef}
          className="group/stage relative flex h-[64vh] w-full items-center justify-center overflow-hidden rounded-2xl bg-muted/60 md:h-[72vh]"
        >
          {isStagePreviewShown && previewImage}
          {stageUrls.map((url) => {
            const isCurrent = url === shownStageUrl
            const isShown = isCurrent && stageReadyUrls.has(url)
            // 元の幅・縦横比が分かるのはメイン画像（1 枚目）だけ
            const sizeHint = pickWorkImageSizeHint(
              url,
              props.imageURLs,
              props.imageSizeHint,
            )
            return (
              <img
                key={url}
                data-stage-url={url}
                className={`absolute inset-0 size-full cursor-zoom-in object-contain ${isShown ? "" : "invisible"}`}
                draggable={false}
                alt={isShown && !isStagePreviewShown ? "thumbnail" : ""}
                src={url}
                srcSet={toResizedImageSrcSet(url, toSrcSetOptions(sizeHint))}
                // 縦横比が分からない 2 枚目以降は、横長でも粗くならないように幅いっぱいとみなす
                sizes={toWorkImageSizes(sizeHint?.aspectRatio)}
                fetchPriority={isCurrent ? "high" : "low"}
                onLoad={(event) => {
                  if (url === props.thumbnailUrl) setIsMainImageLoaded(true)
                  markStageImageReadyAfterDecode(event.currentTarget, url)
                }}
                onError={() => {
                  if (url === props.thumbnailUrl) setIsMainImageLoaded(true)
                  markStageImageReady(url)
                }}
                onTouchStart={handleMainTouchStart}
                onMouseUp={handleMainMouseUp}
                onMouseDown={handleMainMouseDown}
                onTouchEnd={handleMainTouchEnd}
                style={{ userSelect: "none" }}
              />
            )
          })}
          <button
            type="button"
            aria-label="前の画像"
            title="前の画像（A / ←）"
            onClick={prevImage}
            className="absolute left-2 flex size-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/65 md:opacity-0 md:group-hover/stage:opacity-100 md:focus-visible:opacity-100"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="次の画像"
            title="次の画像（D / →）"
            onClick={nextImage}
            className="absolute right-2 flex size-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/65 md:opacity-0 md:group-hover/stage:opacity-100 md:focus-visible:opacity-100"
          >
            <ChevronRight className="size-5" />
          </button>
          <span className="pointer-events-none absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 font-medium text-white text-xs tabular-nums backdrop-blur-sm">
            {isStageImagePending && <Loader2 className="size-3 animate-spin" />}
            {props.currentIndex + 1} / {props.imageURLs.length}
          </span>
        </div>
        {typeof document !== "undefined" && previewOverlay
          ? createPortal(previewOverlay, document.body)
          : null}
      </>
    )
  }

  return (
    <>
      <div className="flex flex-col space-y-4">
        <div className="relative">
          <div
            className="relative m-auto flex h-full max-h-[64vh] w-full cursor-pointer justify-center overflow-hidden rounded-2xl bg-zinc-100 object-contain dark:bg-zinc-900"
            style={isMainImageLoaded ? undefined : { minHeight: "64vh" }}
          >
            {!isMainImageLoaded && previewImage}
            <div className="relative inline-block overflow-hidden text-center">
              <img
                ref={mainImgRef}
                className={cn(
                  "m-auto h-full max-h-[64vh] w-auto cursor-pointer bg-zinc-100 object-contain md:max-h-[72vh] dark:bg-zinc-900",
                  isMainImageHidden && "invisible",
                )}
                draggable={false}
                key={props.thumbnailUrl}
                alt={isMainImageLoaded ? "thumbnail" : ""}
                src={props.thumbnailUrl}
                // 原寸の画像（数 MB のこともある）ではなく、画面に合う縮小版を選ばせる。
                // 拡大表示やダウンロードは原寸のまま
                srcSet={toResizedImageSrcSet(
                  props.thumbnailUrl,
                  mainImageSrcSetOptions,
                )}
                sizes={toWorkImageSizes(
                  props.aspectRatio ?? props.imageSizeHint?.aspectRatio,
                )}
                // 作品ページの LCP 画像なので優先して読み込む
                fetchPriority="high"
                onLoad={() => setIsMainImageLoaded(true)}
                onError={() => setIsMainImageLoaded(true)}
                onTouchStart={handleMainTouchStart}
                onMouseUp={handleMainMouseUp}
                onMouseDown={handleMainMouseDown}
                onTouchEnd={handleMainTouchEnd}
                style={{ userSelect: "none" }}
              />
            </div>
          </div>

          {/* キーボードショートカットヒント */}
          {props.imageURLs.length > 1 && showKeyboardHint && (
            <div className="absolute top-3 left-3 hidden items-center gap-2 rounded-lg bg-black/60 px-3 py-2 text-white backdrop-blur-sm md:flex">
              <Keyboard className="h-4 w-4" />
              <div className="flex items-center gap-1 text-xs">
                <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-xs">
                  A
                </kbd>
                <span>/</span>
                <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-xs">
                  ←
                </kbd>
                <span className="mx-1">•</span>
                <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-xs">
                  D
                </kbd>
                <span>/</span>
                <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-xs">
                  →
                </kbd>
              </div>
            </div>
          )}
        </div>
      </div>
      {typeof document !== "undefined" && previewOverlay
        ? createPortal(previewOverlay, document.body)
        : null}
    </>
  )
}
