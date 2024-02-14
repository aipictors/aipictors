"use client"

import { GenerationResultCard } from "@/app/[lang]/generation/tasks/_components/generation-result-card"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { useSuspenseQuery } from "@apollo/client"

/**
 * use Dynamic Import
 * 画像生成の履歴
 * @returns
 */
export function GenerationTasksList() {
  const { data } = useSuspenseQuery(viewerImageGenerationTasksQuery, {
    variables: {
      limit: 64,
      offset: 0,
    },
  })

  return (
    <div className="space-y-4 pb-4 px-4">
      <p>{"画像生成の履歴"}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {data.viewer?.imageGenerationTasks?.map((task) => (
          <GenerationResultCard taskId={task.id} token={task.token} />
        ))}
      </div>
    </div>
  )
}
