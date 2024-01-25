"use client"

import { imageGenerationTaskQuery } from "@/graphql/queries/image-generation/image-generation-task"
import { useSuspenseQuery } from "@apollo/client"

type Props = {
  taskId: string
}

export const ImageGenerationTaskResult = async (props: Props) => {
  const { data } = useSuspenseQuery(imageGenerationTaskQuery, {
    variables: {
      id: props.taskId,
    },
  })

  console.log("data", data)

  return (
    <div className="px-4 py-4 w-full max-w-fit mx-auto">
      {data.imageGenerationTask.id}
    </div>
  )
}
