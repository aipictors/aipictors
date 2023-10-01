"use client"

import {
  Button,
  Card,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react"

export const GenerationEditorModels = () => {
  return (
    <Card p={4} h={"100%"}>
      <Stack>
        <Text fontWeight={"bold"}>{"モデル"}</Text>
        <SimpleGrid spacing={2} columns={3}>
          <Skeleton height={20} />
          <Skeleton height={20} />
          <Skeleton height={20} />
          <Skeleton height={20} />
          <Skeleton height={20} />
          <Skeleton height={20} />
        </SimpleGrid>
        <Button borderRadius={"full"}>{"もっとモデルを表示する"}</Button>
      </Stack>
    </Card>
  )
}
