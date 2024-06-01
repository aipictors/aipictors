import type * as ResizablePrimitive from "react-resizable-panels"
import { cn } from "@/_lib/cn"
import { ResizablePanel } from "@/_components/ui/resizable"
import {} from "react"
import { getCookie } from "@/_utils/get-cookie"

/**
 * リサイザーパネルのサイズ記憶付きハンドル
 * id（一意）を指定することでCookieにサイズを保存
 */
export const ResizablePanelWithMemory = ({
  id,
  className,
  children,
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) => {
  /**
   * Cookieにサイズを保存
   */
  const setCookie = (name: string, value: number) => {
    document.cookie = `${name}=${value}; path=/`
  }

  /**
   * Cookieからサイズを取得
   */
  const getCookieValue = () => {
    const size = getCookie(`size-${id}`)
    if (size === null) {
      return undefined
    }
    return Number(size)
  }

  /**
   * リサイズするたびにCookieにサイズを保存
   */
  const handleResizeStop = (event: number) => {
    if (event !== 0) {
      setCookie(`size-${id}`, event)
    }
  }

  return (
    <ResizablePanel
      defaultSize={getCookieValue()}
      onResize={(event) => {
        handleResizeStop(event)
      }}
      className={cn(className)}
    >
      {children}
    </ResizablePanel>
  )
}
