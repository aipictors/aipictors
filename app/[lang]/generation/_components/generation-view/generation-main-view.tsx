"use client"

import { GenerationConfigContext } from "@/[lang]/generation/_contexts/generation-config-context"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/_components/ui/resizable"
import { Separator } from "@/_components/ui/separator"
import { config } from "@/config"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  config: React.ReactNode
  promptEditor: React.ReactNode
  negativePromptEditor: React.ReactNode
  taskContentPreview: React.ReactNode
  taskDetails: React.ReactNode
  workContentPreview: React.ReactNode
}

/**
 * 画像生画面のメイン部分
 * @param props
 * @returns
 */
export const GenerationMainView = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  /**
   * スマホの場合リサイザーなし
   */
  if (!isDesktop) {
    return (
      <div className="flex flex-1 flex-col gap-2 overflow-hidden lg:flex-row">
        <div className="lg:min-w-64 xl:min-w-80">{props.config}</div>
        <div className="flex flex-col gap-4 lg:min-w-64 xl:min-w-96 md:flex-row lg:flex-col">
          <div className="flex-1 overflow-hidden">{props.promptEditor}</div>
          <div className="min-w-80 flex-1 overflow-hidden">
            {props.negativePromptEditor}
          </div>
          <div className="gap-y-4 px-4 pb-4">
            <Separator />
          </div>
        </div>
      </div>
    )
  }

  /**
   * 作品プレビューモード
   */
  if (state === "WORK_PREVIEW") {
    return props.workContentPreview
  }

  /**
   * 履歴プレビューモード
   */
  if (state === "HISTORY_PREVIEW") {
    return props.taskContentPreview
  }

  /**
   * 履歴詳細表示モード
   */
  if (
    state === "HISTORY_LIST_FULL" ||
    state === "HISTORY_VIEW_ON_MAIN_AND_HEADER"
  ) {
    return props.taskDetails
  }

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="mt-2 flex flex-1 flex-col gap-4 overflow-hidden lg:flex-row"
    >
      <ResizablePanel className="lg:min-w-40 xl:min-w-40">
        {props.config}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel className="flex flex-col gap-4 lg:min-w-40 xl:min-w-40 md:flex-row lg:flex-col">
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel>
            <div className="h-full flex-1 overflow-hidden">
              {props.promptEditor}
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle className="mt-2 mb-2" />
          <ResizablePanel>
            <div className="h-full flex-1 overflow-hidden">
              {props.negativePromptEditor}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
