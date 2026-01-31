import type * as ResizablePrimitive from "react-resizable-panels"
import { lazy, Suspense } from "react"
import { ClientOnly } from "remix-utils/client-only"

import { cn } from "~/lib/utils"
import { getCookie } from "~/utils/get-cookie"
import { setCookie } from "~/utils/set-cookie"

/* ───── react-resizable-panels をクライアントだけで読み込む ───── */
const LazyResizablePanel = lazy(() =>
  import("~/components/ui/resizable").then((m) => ({
    default: m.ResizablePanel,
  })),
)
/* ---------------------------------------------------------------- */

type Props = React.ComponentProps<
  typeof ResizablePrimitive.PanelResizeHandle
> & {
  withHandle?: boolean
}

/**
 * リサイザーパネルのサイズ記憶付きハンドル（クライアント専用）
 * `id` を一意に指定すると Cookie にサイズを保存 / 復元します。
 */
export function ResizablePanelWithMemory (props: Props): React.ReactNode {
  return (
    <ClientOnly fallback={null}>
      {() => (
        <Suspense fallback={null}>
          <ResizablePanelWithMemoryInner {...props} />
        </Suspense>
      )}
    </ClientOnly>
  )
}

/* ───────── 内部実装：実際の Cookie 読み書き処理 ───────── */

function ResizablePanelWithMemoryInner(
  props: Props & { children?: React.ReactNode },
) {
  /** Cookie からサイズを取得 */
  const getCookieValue = () => {
    const size = getCookie(`size-${props.id}`)
    return size === null ? undefined : Number(size)
  }

  /** リサイズするたびに Cookie へ保存 */
  const handleResizeStop = (newSize: number) => {
    if (newSize !== 0) {
      setCookie(`size-${props.id}`, newSize)
    }
  }

  return (
    <LazyResizablePanel
      defaultSize={getCookieValue()}
      onResize={handleResizeStop}
      className={cn(props.className)}
    >
      {props.children}
    </LazyResizablePanel>
  )
}
