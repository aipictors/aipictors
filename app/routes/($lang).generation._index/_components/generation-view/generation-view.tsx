import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { ResizablePanelWithMemory } from "@/_components/resizable-panel-with-memory"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/_components/ui/resizable"
import { config } from "@/config"
import { GenerationConfigContext } from "@/routes/($lang).generation._index/_contexts/generation-config-context"
import { Suspense } from "react"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  header: React.ReactNode
  main: React.ReactNode
  aside: React.ReactNode
  asideHeader: React.ReactNode
}

/**
 * 画像生成画面
 * @param props
 * @returns
 */
export const GenerationView = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  /**
   * スマホの場合リサイザーなし
   */
  if (!isDesktop) {
    return (
      <main className="flex flex-col gap-2 overflow-hidden pb-4 md:h-main md:flex-row">
        <div className="flex flex-col gap-y-2">
          {props.header}
          {props.main}
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="mx-2">{props.asideHeader}</div>
          {props.aside}
        </div>
      </main>
    )
  }

  if (state === "HISTORY_LIST_FULL" || state === "WORK_LIST_FULL") {
    return (
      <main className="flex flex-col gap-4 overflow-hidden pb-4 md:h-main md:flex-row">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel className="flex flex-col gap-y-2 lg:min-w-80 xl:min-w-80">
            {props.asideHeader}
            {props.aside}
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    )
  }

  return (
    <main className="flex flex-col gap-4 overflow-hidden pb-4 md:h-main md:flex-row">
      <ResizablePanelGroup
        onVolumeChange={(volume) => {
          console.log(volume)
        }}
        defaultValue={1}
        direction="horizontal"
      >
        <ResizablePanelWithMemory
          id="generation-header-main"
          className="flex flex-col"
        >
          <Suspense fallback={<AppLoadingPage />}>{props.header}</Suspense>
          <Suspense fallback={<AppLoadingPage />}>{props.main}</Suspense>
        </ResizablePanelWithMemory>
        <ResizableHandle withHandle className="mr-4 ml-4" />
        <ResizablePanelWithMemory
          id="generation-aside-header-aside"
          className="flex flex-col gap-y-2 lg:min-w-80 xl:min-w-80"
        >
          <Suspense fallback={<AppLoadingPage />}>
            {props.asideHeader}
            {props.aside}
          </Suspense>
        </ResizablePanelWithMemory>
      </ResizablePanelGroup>
    </main>
  )
}
