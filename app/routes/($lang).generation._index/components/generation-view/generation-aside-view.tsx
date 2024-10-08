import { KeyCodes } from "~/config"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useCallback, useEffect } from "react"

type Props = {
  /**
   * 広告
   */
  advertisement: React.ReactNode
  /**
   * タスクの一覧
   */
  taskList: React.ReactNode
  /**
   * タスクの詳細
   */
  taskDetails: React.ReactNode
  /**
   * モデルから作品検索
   */
  workListFromModel: React.ReactNode
  /**
   * コミュニケーション
   */
  communication: React.ReactNode
  /**
   * リンク
   */
  links: React.ReactNode
}

/**
 * 画像生成画面のサイド部分
 */
export function GenerationAsideView(props: Props) {
  const context = useGenerationContext()

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  const { send } = GenerationConfigContext.useActorRef()

  const handleEscapeKeyDown = useCallback((event: { keyCode: number }) => {
    if (event.keyCode === KeyCodes.ESCAPE) {
      send({ type: "CLOSE_PREVIEW" })
    }
  }, [])

  useEffect(() => {
    if (typeof document === "undefined") return
    document.addEventListener("keydown", handleEscapeKeyDown, false)
    return () => {
      document.removeEventListener("keydown", handleEscapeKeyDown)
    }
  }, [])

  if (state === "HISTORY_VIEW_ON_ASIDE") {
    return (
      <>
        {context.currentPass?.type !== "PREMIUM" && props.advertisement}
        {props.taskDetails}
      </>
    )
  }

  if (
    state === "WORKS_FROM_MODEL" ||
    state === "WORK_PREVIEW" ||
    state === "WORK_LIST_FULL"
  ) {
    return <>{props.workListFromModel}</>
  }

  if (state === "COMMUNICATION") {
    return <>{props.communication}</>
  }

  if (state === "LINKS") {
    return <>{props.links}</>
  }

  if (state === "HISTORY_LIST_FULL") {
    return <>{props.taskList}</>
  }

  return (
    <>
      {context.currentPass?.type !== "PREMIUM" && props.advertisement}
      {props.taskList}
    </>
  )
}
