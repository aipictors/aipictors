import type * as ResizablePrimitive from "react-resizable-panels"
import { cn } from "~/lib/utils"
import { ResizablePanel } from "~/components/ui/resizable"
import { getCookie } from "~/utils/get-cookie"
import { setCookie } from "~/utils/set-cookie"

type Props = React.ComponentProps<
  typeof ResizablePrimitive.PanelResizeHandle
> & {
  withHandle?: boolean
}

/**
 * リサイザーパネルのサイズ記憶付きハンドル
 * id（一意）を指定することでCookieにサイズを保存
 */
export function ResizablePanelWithMemory(props: Props) {
  /**
   * Cookieからサイズを取得
   */
  const getCookieValue = () => {
    const size = getCookie(`size-${props.id}`)
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
      setCookie(`size-${props.id}`, event)
    }
  }

  return (
    <ResizablePanel
      defaultSize={getCookieValue()}
      onResize={(event) => {
        handleResizeStop(event)
      }}
      className={cn(props.className)}
    >
      {props.children}
    </ResizablePanel>
  )
}
