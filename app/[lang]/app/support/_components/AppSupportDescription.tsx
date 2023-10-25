"use client"
import { HStack, Stack, Text } from "@chakra-ui/react"

export const AppSupportDescription: React.FC = () => {
  return (
    <HStack justifyContent={"center"} py={8} minH={"100vh"}>
      <Stack>
        <Text textAlign={"center"}>{"お問い合わせはこちらまで"}</Text>
        <Text textAlign={"center"} fontWeight={"bold"}>
          {"hello@aipictors.com"}
        </Text>
      </Stack>
    </HStack>
  )
}
