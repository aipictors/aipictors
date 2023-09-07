"use client"
import { HStack, Text } from "@chakra-ui/react"
import { FC } from "react"

export const MainPlusSuccess: FC = () => {
  return (
    <HStack justifyContent={"center"} py={16} minH={"100vh"}>
      <Text>{"決済に成功しました。"}</Text>
    </HStack>
  )
}
