import { ChevronLeft, ChevronRight, XIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type Image = { src: string; alt: string }

type Props = {
  images: Image[]
  /** 開いている画像の番号。閉じているときは null */
  index: number | null
  onChangeIndex: (index: number | null) => void
}

/**
 * 画像の拡大表示（お知らせの本文の画像を押したとき）
 * - 画面いっぱいに元の比率で出す。背景・✕・Esc で閉じる
 * - 複数枚あれば ← → ・左右のボタン・スワイプで前後へ
 * - 画像を押すと横幅いっぱいに広げる（縦長の 4 コマなどは画面に収めると文字が小さいので、スクロールして読める）
 */
export function ReleaseImageLightbox(props: Props) {
  const t = useTranslation()
  const { images, index, onChangeIndex } = props
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [isZoomed, setIsZoomed] = useState(false)

  // 別の画像に移ったら、画面に収める表示に戻す
  useEffect(() => {
    setIsZoomed(false)
  }, [index])

  const isOpen = index !== null && images[index] !== undefined
  const hasMany = images.length > 1

  const move = useCallback(
    (delta: number) => {
      if (index === null) return
      onChangeIndex((index + delta + images.length) % images.length)
    },
    [index, images.length, onChangeIndex],
  )

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onChangeIndex(null)
      if (event.key === "ArrowRight") move(1)
      if (event.key === "ArrowLeft") move(-1)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [isOpen, move, onChangeIndex])

  if (!isOpen || typeof document === "undefined") return null

  const image = images[index]

  return createPortal(
    // biome-ignore lint/a11y/useKeyWithClickEvents: 背景を押して閉じるだけ（キーボードは Esc で閉じる）
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("画像の拡大表示", "Enlarged image")}
      className={cn(
        "fade-in-0 fixed inset-0 z-[200] flex animate-in justify-center overflow-auto overscroll-contain bg-black/90 backdrop-blur-sm duration-200",
        isZoomed ? "items-start" : "items-center",
      )}
      onClick={() => onChangeIndex(null)}
      onTouchStart={(event) =>
        setTouchStartX(event.touches[0]?.clientX ?? null)
      }
      onTouchEnd={(event) => {
        if (touchStartX === null || !hasMany) return
        const dx =
          (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX
        if (Math.abs(dx) > 50) move(dx < 0 ? 1 : -1)
        setTouchStartX(null)
      }}
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: 画像を押して広げるだけ（閉じる・送るはキーボードでもできる） */}
      <img
        key={image.src}
        src={image.src}
        alt={image.alt}
        className={cn(
          "zoom-in-95 animate-in select-none rounded-md shadow-2xl duration-200",
          isZoomed
            ? "my-16 h-auto w-[min(1200px,96vw)] max-w-none cursor-zoom-out"
            : "max-h-[92vh] max-w-[96vw] cursor-zoom-in object-contain",
        )}
        onClick={(event) => {
          event.stopPropagation()
          setIsZoomed((value) => !value)
        }}
      />
      <button
        type="button"
        aria-label={t("閉じる", "Close")}
        className="fixed top-3 right-3 flex size-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/25"
        onClick={() => onChangeIndex(null)}
      >
        <XIcon className="size-6" />
      </button>
      {hasMany && (
        <>
          <button
            type="button"
            aria-label={t("前の画像", "Previous image")}
            className="-translate-y-1/2 fixed top-1/2 left-2 flex size-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/25 md:left-4"
            onClick={(event) => {
              event.stopPropagation()
              move(-1)
            }}
          >
            <ChevronLeft className="size-7" />
          </button>
          <button
            type="button"
            aria-label={t("次の画像", "Next image")}
            className="-translate-y-1/2 fixed top-1/2 right-2 flex size-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/25 md:right-4"
            onClick={(event) => {
              event.stopPropagation()
              move(1)
            }}
          >
            <ChevronRight className="size-7" />
          </button>
          <div className="-translate-x-1/2 fixed bottom-4 left-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white tabular-nums backdrop-blur">
            {index + 1} / {images.length}
          </div>
        </>
      )}
    </div>,
    document.body,
  )
}
