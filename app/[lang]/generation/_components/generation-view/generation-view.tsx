"use client"

import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { AppLoadingPage } from "@/components/app/app-loading-page"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { config } from "@/config"
import { Suspense } from "react"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  header: React.ReactNode
  main: React.ReactNode
  aside: React.ReactNode
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
      <main className="flex flex-col gap-4 overflow-hidden pb-4 lg:h-main lg:flex-row">
        <div className="flex flex-col gap-y-4">
          {props.header}
          {props.main}
        </div>
        <div className="flex-1 overflow-hidden">{props.aside}</div>
      </main>
    )
  }

  console.log(state)

  if (state === "HISTORY_LIST_FULL") {
    return (
      <main className="flex flex-col gap-4 overflow-hidden pb-4 lg:h-main lg:flex-row">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel className="lg:min-w-80 xl:min-w-80">
            {props.aside}
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    )
  }

  return (
    <main className="flex flex-col gap-4 overflow-hidden pb-4 lg:h-main lg:flex-row">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <Suspense fallback={<AppLoadingPage />}>{props.header}</Suspense>
          <Suspense fallback={<AppLoadingPage />}>{props.main}</Suspense>
        </ResizablePanel>
        <ResizableHandle withHandle className="mr-4 ml-4" />
        <ResizablePanel className="lg:min-w-80 xl:min-w-80">
          <Suspense fallback={<AppLoadingPage />}>{props.aside}</Suspense>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  )
}