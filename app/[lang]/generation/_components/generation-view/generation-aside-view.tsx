"use client"

import { GenerationEditorLayoutHistoryListArea } from "@/app/[lang]/generation/_components/generation-editor-layout-history-list-area"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"

type Props = {
  advertising: React.ReactNode
  taskList: React.ReactNode
  taskDetails: React.ReactNode
}

/**
 * 画像生成画面のサイド部分
 * @param props
 * @returns
 */
export const GenerationAsideView = (props: Props) => {
  const context = useGenerationContext()

  return (
    <>
      {context.currentPass?.type !== "PREMIUM" && props.advertising}
      <GenerationEditorLayoutHistoryListArea
        taskList={props.taskList}
        taskDetails={props.taskDetails}
      />
    </>
  )
}
