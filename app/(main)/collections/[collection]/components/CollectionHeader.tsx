"use client"
import { Button, HStack, Stack, Text } from "@chakra-ui/react"

export const CollectionHeader: React.FC = () => {
  return (
    <Stack>
      <HStack justifyContent={"space-between"}>
        <Text>{"コレクション名"}</Text>
        <Button colorScheme="primary" borderRadius={"full"} size={"sm"}>
          {"フォローする"}
        </Button>
      </HStack>
      <Text>{"コレクションの説明"}</Text>
    </Stack>
  )
}
