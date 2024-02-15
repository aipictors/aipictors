"use client"

import { GenerationResultCard } from "@/app/[lang]/generation/tasks/_components/generation-result-card"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { useSuspenseQuery } from "@apollo/client"
import { useState } from "react"

/**
 * use Dynamic Import
 * 画像生成の履歴
 * @returns
 */
export function GenerationTasksList() {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

  const { data } = useSuspenseQuery(viewerImageGenerationTasksQuery, {
    variables: {
      limit: 64,
      offset: 0,
      where: {},
    },
  })

  return (
    <div className="space-y-4 pb-4">
      <p>{"画像生成の履歴"}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {data.viewer?.imageGenerationTasks?.map((task) => (
          <GenerationResultCard
            key={task.id}
            taskId={task.id}
            token={task.token}
            isSelected={selectedTaskIds.includes(task.nanoid ?? "")}
          />
        ))}
      </div>
    </div>
  )
}
