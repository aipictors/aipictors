"use client"

import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"

type Props = {
  taskList: React.ReactNode
  taskDetails: React.ReactNode
}

/**
 * エディタの履歴一覧エリア
 * @param props
 * @returns
 */
export const GenerationEditorLayoutHistoryListArea = (props: Props) => {
  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  if (state === "HISTORY_VIEW") {
    return <>{props.taskDetails}</>
  }

  return <>{props.taskList}</>
}