"use client"

import {
  ViewerImageGenerationTasksDocument,
  ViewerImageGenerationTasksQuery,
  ViewerImageGenerationTasksQueryVariables,
} from "@/__generated__/apollo"
import { GenerationHistoryCard } from "@/app/[lang]/(beta)/generation/history/_components/generation-history-card"
import { useSuspenseQuery } from "@apollo/client"
import { SimpleGrid, Stack, Text } from "@chakra-ui/react"
import React from "react"

/**
 * 画像生成の履歴
 * @returns
 */
export const GenerationHistoryList: React.FC = () => {
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
    <Stack spacing={4} pb={4} px={4}>
      <Text>{"画像生成の履歴"}</Text>
      <SimpleGrid spacing={2} columns={{ base: 2, md: 3, lg: 4, xl: 6 }}>
        {data.viewer?.imageGenerationTasks?.map((task) => (
          <GenerationHistoryCard imageURL={task.imageURL!} onClick={() => {}} />
        ))}
      </SimpleGrid>
    </Stack>
  )
}
