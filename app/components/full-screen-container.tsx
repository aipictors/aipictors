import { Button } from "~/components/ui/button"
import { cn } from "~/lib/cn"
import { XIcon } from "lucide-react"
import { useCallback, useEffect } from "react"

type Props = {
  children: React.ReactNode
  enabledScroll: boolean
  onClose?: () => void
}

/**
 * 画面全体へ表示するためのコンテナー
 */
export function FullScreenContainer(props: Props) {
  /**
   * Escキーで閉じる
   */
  const handleEscapeKeyDown = useCallback((event: KeyboardEvent) => {
    const tagName = document.activeElement?.tagName.toLowerCase()
    if (tagName === "input" || tagName === "textarea") {
      return
    }

    switch (event.keyCode) {
      case 27: // Key 'Esc'
        props.onClose?.()
        break
      default:
        break
    }
  }, [])

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.addEventListener("keydown", handleEscapeKeyDown, false)
      return () => {
        document.removeEventListener("keydown", handleEscapeKeyDown)
      }
    }
  }, [])

  return (
    <div
      className={cn(
        `${props.enabledScroll ? "overflow-hidden" : ""}`,
        "fixed top-0 left-0 z-50 h-[100vh] w-[100vw] bg-white dark:bg-black",
      )}
    >
      <div
        className={cn(
          `${props.enabledScroll ? "overflow-hidden" : "overflow-y-auto"}`,
          "relative z-60 block h-[100%] md:flex",
        )}
      >
        {props.children}
      </div>
      <Button
        className="absolute top-4 right-8"
        variant={"ghost"}
        size={"icon"}
        onClick={props.onClose}
      >
        <XIcon className="w-8" />
      </Button>
    </div>
  )
}

export default FullScreenContainer
