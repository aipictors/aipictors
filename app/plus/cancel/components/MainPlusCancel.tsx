"use client"
import { HStack, Text } from "@chakra-ui/react"
import { FC } from "react"

export const MainPlusCancel: FC = () => {
  return (
    <HStack justifyContent={"center"} py={16} minH={"100vh"}>
      <Text>{"決済がキャンセルされました。"}</Text>
    </HStack>
  )
}
