"use client"

import { GenerationEditorLayoutSettingArea } from "@/app/[lang]/generation/_components/generation-editor-layout-setting-area"

type Props = {
  config: React.ReactNode
  promptEditor: React.ReactNode
  negativePromptEditor: React.ReactNode
  taskContentPreview: React.ReactNode
  taskDetails: React.ReactNode
}

/**
 * 画像生画面のメイン部分
 * @param props
 * @returns
 */
export const GenerationMainView = (props: Props) => {
  return (
    <>
      <GenerationEditorLayoutSettingArea
        config={props.config}
        promptEditor={props.promptEditor}
        negativePromptEditor={props.negativePromptEditor}
        taskContentPreview={props.taskContentPreview}
        taskDetails={props.taskDetails}
      />
    </>
  )
}
