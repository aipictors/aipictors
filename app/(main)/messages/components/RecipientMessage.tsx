"use client"
import { Avatar, Card, HStack, Stack, Text } from "@chakra-ui/react"

export const RecipientMessage: React.FC = () => {
  const AvatarURL =
    "https://www.aipictors.com/wp-content/uploads/2023/04/aTyRPjXLGxJB9EKrqSM43CYfWFQ8is.webp"

  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <HStack spacing={4}>
          <Avatar bg="teal.500" src={AvatarURL} />
          <Stack spacing={4}>
            <Card
              px={6}
              py={2}
              borderRightRadius={"full"}
              borderBottomLeftRadius={"full"}
            >
              <Text> {"Hello"}</Text>
            </Card>
          </Stack>
        </HStack>
      </Stack>
    </HStack>
  )
}
