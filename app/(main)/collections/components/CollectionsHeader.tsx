"use client"
import { Button, HStack, Stack, Text } from "@chakra-ui/react"

export const CollectionsHeader: React.FC = () => {
  return (
    <Stack>
      <Text>{"コレクション一覧"}</Text>
      <HStack>
        <Button colorScheme="primary" borderRadius={"full"} size={"sm"}>
          {"検索"}
        </Button>
      </HStack>
    </Stack>
  )
}
