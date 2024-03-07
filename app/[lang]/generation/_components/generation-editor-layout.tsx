"use client"

import { GenerationEditorLayoutHistoryListArea } from "@/app/[lang]/generation/_components/generation-editor-layout-history-list-area"
import { GenerationEditorLayoutSettingArea } from "@/app/[lang]/generation/_components/generation-editor-layout-setting-area"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { config } from "@/config"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  config: React.ReactNode
  promptEditor: React.ReactNode
  negativePromptEditor: React.ReactNode
  submission: React.ReactNode
  taskList: React.ReactNode
  taskDetails: React.ReactNode
  taskContent: React.ReactNode
}

/**
 * エディタのレイアウト
 * @param props
 * @returns
 */
export const GenerationEditorLayout = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  /**
   * スマホの場合リサイザーなし
   */
  if (!isDesktop) {
    return (
      <main className="flex flex-col lg:flex-row gap-4 lg:h-main pb-4 overflow-hidden">
        <div className="flex flex-col gap-y-4">
          <GenerationEditorLayoutSettingArea
            config={props.config}
            submission={props.submission}
            promptEditor={props.promptEditor}
            negativePromptEditor={props.negativePromptEditor}
            taskContent={props.taskContent}
          />
        </div>
        <div className="flex-1 overflow-hidden">{props.taskList}</div>
      </main>
    )
  }

  return (
    <main className="flex flex-col lg:flex-row gap-4 lg:h-main pb-4 overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <GenerationEditorLayoutSettingArea
            config={props.config}
            submission={props.submission}
            promptEditor={props.promptEditor}
            negativePromptEditor={props.negativePromptEditor}
            taskContent={props.taskContent}
          />
        </ResizablePanel>
        <ResizableHandle withHandle className="mr-4 ml-4" />
        <ResizablePanel className="lg:min-w-80 xl:min-w-80">
          <GenerationEditorLayoutHistoryListArea
            taskList={props.taskList}
            taskDetails={props.taskDetails}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  )
}
