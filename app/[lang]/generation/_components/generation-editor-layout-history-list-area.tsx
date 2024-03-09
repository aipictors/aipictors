"use client"

import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { useCallback, useEffect } from "react"

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

  const { send } = GenerationConfigContext.useActorRef()

  const handleEscapeKeyDown = useCallback((event: { keyCode: number }) => {
    if (event.keyCode === 27) {
      send({ type: "CLOSE_PREVIEW" })
    }
  }, [])

  useEffect(() => {
    document.addEventListener("keydown", handleEscapeKeyDown, false)
  }, [])

  if (state === "HISTORY_VIEW_ON_ASIDE") {
    return <>{props.taskDetails}</>
  }

  return <>{props.taskList}</>
}
