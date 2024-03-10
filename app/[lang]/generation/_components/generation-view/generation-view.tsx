"use client"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { config } from "@/config"
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

  return (
    <main className="flex flex-col gap-4 overflow-hidden pb-4 lg:h-main lg:flex-row">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          {props.header}
          {props.main}
        </ResizablePanel>
        <ResizableHandle withHandle className="mr-4 ml-4" />
        <ResizablePanel className="lg:min-w-80 xl:min-w-80">
          {props.aside}
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  )
}
