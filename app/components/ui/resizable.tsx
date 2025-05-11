import { GripVertical } from "lucide-react"
import { lazy, Suspense } from "react"
import { ClientOnly } from "remix-utils/client-only"

import { cn } from "~/lib/utils"

/* ---------------- ここで react-resizable-panels を遅延ロード ---------------- */
const LazyPanelGroup = lazy(() =>
  import("react-resizable-panels").then((m) => ({ default: m.PanelGroup })),
)
const LazyPanel = lazy(() =>
  import("react-resizable-panels").then((m) => ({ default: m.Panel })),
)
const LazyResizeHandle = lazy(() =>
  import("react-resizable-panels").then((m) => ({
    default: m.PanelResizeHandle,
  })),
)
/* -------------------------------------------------------------------------- */

export const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof LazyPanelGroup>) => (
  <ClientOnly fallback={null}>
    {() => (
      <Suspense fallback={null}>
        <LazyPanelGroup
          className={cn(
            "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
            className,
          )}
          {...props}
        />
      </Suspense>
    )}
  </ClientOnly>
)

export const ResizablePanel = (
  props: React.ComponentProps<typeof LazyPanel>,
) => (
  <ClientOnly fallback={null}>
    {() => (
      <Suspense fallback={null}>
        <LazyPanel {...props} />
      </Suspense>
    )}
  </ClientOnly>
)

export const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof LazyResizeHandle> & {
  withHandle?: boolean
}) => (
  <ClientOnly fallback={null}>
    {() => (
      <Suspense fallback={null}>
        <LazyResizeHandle
          className={cn(
            "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
            className,
          )}
          {...props}
        >
          {withHandle && (
            <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
              <GripVertical className="h-2.5 w-2.5" />
            </div>
          )}
        </LazyResizeHandle>
      </Suspense>
    )}
  </ClientOnly>
)
