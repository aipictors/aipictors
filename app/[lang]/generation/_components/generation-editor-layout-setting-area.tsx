"use client"

import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { config } from "@/config"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  config: React.ReactNode
  submission: React.ReactNode
  promptEditor: React.ReactNode
  negativePromptEditor: React.ReactNode
  taskContent: React.ReactNode
}

/**
 * エディタの設定エリア
 * @param props
 * @returns
 */
export const GenerationEditorLayoutSettingArea = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  /**
   * スマホの場合リサイザーなし
   */
  if (!isDesktop) {
    return (
      <>
        <div>{props.submission}</div>
        <div className="flex flex-1 flex-col lg:flex-row gap-4 overflow-hidden">
          <div className="lg:min-w-64 xl:min-w-80">{props.config}</div>
          <div className="lg:min-w-64 xl:min-w-96 flex flex-col md:flex-row lg:flex-col gap-4">
            <div className="overflow-hidden flex-1">{props.promptEditor}</div>
            <div className="overflow-hidden flex-1 min-w-80">
              {props.negativePromptEditor}
            </div>
          </div>
        </div>
      </>
    )
  }

  /**
   * プレビュータスクが設定されている場合
   */
  if (state === "HISTORY_PREVIEW") {
    return <>{props.taskContent}</>
  }

  return (
    <>
      <div>{props.submission}</div>
      <ResizablePanelGroup
        direction="horizontal"
        style={{ height: "calc(100% - 130px)" }}
        className="flex flex-1 flex-col lg:flex-row mt-2 gap-4 overflow-hidden"
      >
        <ResizablePanel className="lg:min-w-40 xl:min-w-40">
          {props.config}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel className="lg:min-w-40 xl:min-w-40 flex flex-col md:flex-row lg:flex-col gap-4">
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel>
              <div className="overflow-hidden h-full flex-1">
                {props.promptEditor}
              </div>
            </ResizablePanel>
            <ResizableHandle className="mb-2 mt-2" />
            <ResizablePanel>
              <div className="overflow-hidden h-full flex-1 min-w-80">
                {props.negativePromptEditor}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  )
}