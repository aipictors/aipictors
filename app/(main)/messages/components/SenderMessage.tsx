"use client"
import { Card, HStack, Stack, Text } from "@chakra-ui/react"

export const SenderMessage: React.FC = () => {
  return (
    <HStack justifyContent={"flex-end"}>
      <Stack>
        <Card
          px={6}
          py={2}
          borderLeftRadius={"full"}
          borderBottomRightRadius={"full"}
          bg={"teal.500"}
        >
          <Text> {"Hello"}</Text>
        </Card>
        <HStack justifyContent={"flex-end"}>
          <Text fontSize={"2xs"}> {"19:04"}</Text>
        </HStack>
      </Stack>
    </HStack>
  )
}
