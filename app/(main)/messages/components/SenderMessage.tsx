"use client"
import { Card, HStack, Text } from "@chakra-ui/react"

export const SenderMessage: React.FC = () => {
  return (
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
  )
}
