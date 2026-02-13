import { XIcon } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

type Props = {
  children: React.ReactNode
  enabledScroll: boolean
  onClose?: () => void
}

/**
 * 画面全体へ表示するためのコンテナー
 */
export function FullScreenContainer(props: Props): React.ReactNode {
  const [isMounted, setIsMounted] = useState(false)

  /**
   * Escキーで閉じる
   */
  const handleEscapeKeyDown = useCallback(
    (event: KeyboardEvent) => {
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
    },
    [props.onClose],
  )

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.addEventListener("keydown", handleEscapeKeyDown, false)
      return () => {
        document.removeEventListener("keydown", handleEscapeKeyDown)
      }
    }
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const contents = useMemo(() => {
    return (
      <div
        className={cn(
          `${props.enabledScroll ? "overflow-hidden" : ""}`,
          "fixed top-0 left-0 z-[300] h-[100vh] w-[100vw] bg-white dark:bg-black",
        )}
      >
        <div
          className={cn(
            `${props.enabledScroll ? "overflow-hidden" : "overflow-y-auto"}`,
            "relative block h-[100%] md:flex",
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
  }, [props.children, props.enabledScroll, props.onClose])

  if (!isMounted || typeof document === "undefined") {
    return null
  }

  return createPortal(contents, document.body)
}

export default FullScreenContainer
