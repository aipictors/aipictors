"use client"
import { HStack, Stack, Text } from "@chakra-ui/react"
import { FC } from "react"

export const MainSettingStickersDownloads: FC = () => {
  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"DL済みスタンプ"}
        </Text>
      </Stack>
    </HStack>
  )
}
