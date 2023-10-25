"use client"
import { HStack, Stack, Text } from "@chakra-ui/react"
import { useText } from "app/_hooks/useText"

export const AppSupportDescription: React.FC = () => {
  const t = useText()

  return (
    <HStack justifyContent={"center"} py={8} minH={"100vh"}>
      <Stack>
        <Text textAlign={"center"}>
          {t("お問い合わせはこちらまで", "The inquiry to this:")}
        </Text>
        <Text textAlign={"center"} fontWeight={"bold"}>
          {"hello@aipictors.com"}
        </Text>
      </Stack>
    </HStack>
  )
}
