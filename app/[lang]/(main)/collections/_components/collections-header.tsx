"use client"

import { Button, HStack, Input, Stack, Text } from "@chakra-ui/react"

export const CollectionsHeader = () => {
  return (
    <Stack>
      <Text>{"コレクション一覧"}</Text>
      <HStack>
        <Input placeholder={"コレクション名"} />
        <Button colorScheme="primary" borderRadius={"full"} size={"sm"}>
          {"検索"}
        </Button>
      </HStack>
    </Stack>
  )
}
