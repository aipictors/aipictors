"use client"

import { SimpleGrid, Stack, Text } from "@chakra-ui/react"
import { GenerationHistoryCard } from "app/[lang]/(beta)/generation/history/_components/GenerationHistoryCard"
import React from "react"

/**
 * 画像生成の履歴
 * @returns
 */
export const GenerationHistoryList: React.FC = () => {
  return (
    <Stack spacing={4} pb={4} px={4}>
      <Text>{"画像生成の履歴"}</Text>
      <SimpleGrid spacing={2} columns={{ base: 2, md: 3, lg: 4, xl: 6 }}>
        <GenerationHistoryCard onClick={() => {}} />
        <GenerationHistoryCard onClick={() => {}} />
      </SimpleGrid>
    </Stack>
  )
}
