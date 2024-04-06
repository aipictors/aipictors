"use client"

import { GenerationViewCard } from "@/[lang]/generation/_components/generation-view-card"
import { GenerationTaskDetails } from "@/[lang]/generation/_components/task-view/generation-task-details"
import { GenerationConfigContext } from "@/[lang]/generation/_contexts/generation-config-context"
import { Button } from "@/_components/ui/button"

/**
 * 生成履歴詳細
 * @param props
 * @returns
 */
export const GenerationTaskDetailsView = () => {
  const { send } = GenerationConfigContext.useActorRef()

  const onCancel = () => {
    send({ type: "CLOSE_PREVIEW" })
  }

  return (
    <GenerationViewCard
      title={"履歴詳細"}
      tooltip={"履歴に関する操作が可能です"}
    >
      <Button className="mx-4 my-2" variant={"secondary"} onClick={onCancel}>
        {"閉じる"}
        <span className="hidden md:inline-block">{"（Escape）"}</span>
      </Button>

      <GenerationTaskDetails />
    </GenerationViewCard>
  )
}
