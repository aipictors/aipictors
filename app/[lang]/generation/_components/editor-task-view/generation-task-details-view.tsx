"use client"

import { GenerationTaskDetails } from "@/app/[lang]/generation/_components/editor-task-view/generation-task-details"
import { GenerationViewCard } from "@/app/[lang]/generation/_components/generation-view-card"
import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { Button } from "@/components/ui/button"

/**
 * 生成履歴詳細
 * @param props
 * @returns
 */
export const GenerationTaskDetailsView = () => {
  const { send } = GenerationConfigContext.useActorRef()

  const onCancel = () => {
    send({ type: "CLOSE" })
  }

  return (
    <GenerationViewCard
      title={"生成履歴"}
      tooltip={
        "履歴は1週間、スタンダードの場合は2週間まで保存されます。★を付与することで永久保存できます。プランによって保存できる上限が変わります。"
      }
      tooltipDetailLink={"/plus"}
    >
      <Button className="m-2" variant={"secondary"} onClick={onCancel}>
        {"閉じる"}
      </Button>

      <GenerationTaskDetails />
    </GenerationViewCard>
  )
}
