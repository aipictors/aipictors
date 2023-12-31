"use client"

import {
  ViewerImageGenerationTasksDocument,
  ViewerImageGenerationTasksQuery,
  ViewerImageGenerationTasksQueryVariables,
} from "@/__generated__/apollo"
import { GenerationHistoryCard } from "@/app/[lang]/(beta)/generation/history/_components/generation-history-card"
import { useSuspenseQuery } from "@apollo/client"

/**
 * 画像生成の履歴
 * @returns
 */
export const GenerationHistoryList = () => {
  const { data } = useSuspenseQuery<
    ViewerImageGenerationTasksQuery,
    ViewerImageGenerationTasksQueryVariables
  >(ViewerImageGenerationTasksDocument, {
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
          <GenerationHistoryCard
            taskId={task.id}
            token={task.token}
            onClick={() => {}}
          />
        ))}
      </div>
    </div>
  )
}
