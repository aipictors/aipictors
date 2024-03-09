"use client"

import { GenerationEditorLayoutHistoryListArea } from "@/app/[lang]/generation/_components/generation-editor-layout-history-list-area"

type Props = {
  taskList: React.ReactNode
  taskDetails: React.ReactNode
}

/**
 * 画像生成画面のサイド部分
 * @param props
 * @returns
 */
export const GenerationAsideView = (props: Props) => {
  return (
    <>
      <GenerationEditorLayoutHistoryListArea
        taskList={props.taskList}
        taskDetails={props.taskDetails}
      />
    </>
  )
}
