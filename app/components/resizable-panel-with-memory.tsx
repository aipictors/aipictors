import type * as ResizablePrimitive from "react-resizable-panels"
import { cn } from "~/lib/cn"
import { ResizablePanel } from "~/components/ui/resizable"
import { getCookie } from "~/utils/get-cookie"
import { setCookie } from "~/utils/set-cookie"

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
