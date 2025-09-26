import { AppLoadingPage } from "~/components/app/app-loading-page"
import { ResizablePanelWithMemory } from "~/components/resizable-panel-with-memory"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { GenerationAnnouncementBanner } from "~/routes/($lang).generation._index/components/generation-announcement-banner"
import { CharacterExpressionBanner } from "~/routes/($lang).generation._index/components/character-expression-banner"
import { Suspense } from "react"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  header: React.ReactNode
  main: React.ReactNode
  aside: React.ReactNode
  asideHeader: React.ReactNode
  menu: React.ReactNode
  footer: React.ReactNode
}

/**
 * 画像生成画面
 */
export function GenerationView(props: Props) {
  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  /**
   * スマホの場合リサイザーなし
   */
  if (!useMediaQuery("(min-width: 768px)")) {
    return (
      <div className="flex flex-col space-y-2 pb-16">
        <GenerationAnnouncementBanner />
        <CharacterExpressionBanner />
        <main className="flex flex-col gap-2 overflow-hidden pb-4 md:flex-row">
          <div className="flex flex-col gap-y-2">
            {props.header}
            {props.main}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="mx-2">{props.asideHeader}</div>
            {props.aside}
          </div>
        </main>
        {props.footer}
      </div>
    )
  }

  if (state === "HISTORY_LIST_FULL" || state === "WORK_LIST_FULL") {
    return (
      <div className="flex flex-col space-y-2 md:h-[calc(100vh-72px)]">
        <GenerationAnnouncementBanner />
        <CharacterExpressionBanner />
        <main className="flex h-full flex-col gap-4 overflow-hidden md:flex-row">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel className="flex flex-col gap-y-2 lg:min-w-80 xl:min-w-80">
              {props.asideHeader}
              {props.aside}
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
        {props.footer}
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-2 md:h-[calc(100vh-72px)]">
      <GenerationAnnouncementBanner />
      <CharacterExpressionBanner />
      <main className="flex h-full flex-col gap-4 overflow-hidden md:flex-row">
        <ResizablePanelGroup defaultValue={1} direction="horizontal">
          <ResizablePanelWithMemory
            id="generation-header-menu"
            className="flex flex-col"
          >
            <Suspense fallback={<AppLoadingPage />}>{props.menu}</Suspense>
          </ResizablePanelWithMemory>
          <ResizableHandle withHandle className="mr-4 ml-4" />
          <ResizablePanelWithMemory
            id="generation-header-main"
            className="flex flex-col"
          >
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
      {props.footer}
    </div>
  )
}
