"use client"
import { Card, HStack, Stack, Text } from "@chakra-ui/react"

export const SenderMessage: React.FC = () => {
  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <HStack justifyContent={"flex-end"}>
          <Card
            px={6}
            py={2}
            borderLeftRadius={"full"}
            borderBottomRightRadius={"full"}
            bg={"teal.500"}
          >
            <Text> {"Hello"}</Text>
          </Card>
        </HStack>
      </Stack>
    </HStack>
  )
}
