"use client"

import { GenerationAsideView } from "@/app/[lang]/generation/_components/generation-view/generation-aside-view"
import { GenerationHeaderView } from "@/app/[lang]/generation/_components/generation-view/generation-header-view"
import { GenerationMainView } from "@/app/[lang]/generation/_components/generation-view/generation-main-view"
import { GenerationView } from "@/app/[lang]/generation/_components/generation-view/generation-view"

type Props = {
  config: React.ReactNode
  promptEditor: React.ReactNode
  negativePromptEditor: React.ReactNode
  submission: React.ReactNode
  taskList: React.ReactNode
  taskDetails: React.ReactNode
  taskContentPreview: React.ReactNode
}

/**
 * エディタのレイアウト
 * @param props
 * @returns
 */
export const GenerationEditorLayout = (props: Props) => {
  return (
    <GenerationView
      header={<GenerationHeaderView submission={props.submission} />}
      aside={
        <GenerationAsideView
          taskList={props.taskList}
          taskDetails={props.taskDetails}
        />
      }
      main={
        <GenerationMainView
          config={props.config}
          promptEditor={props.promptEditor}
          negativePromptEditor={props.negativePromptEditor}
          taskContentPreview={props.taskContentPreview}
          taskDetails={props.taskDetails}
        />
      }
    />
  )
}
