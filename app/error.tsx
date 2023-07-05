"use client"
import { Text, Stack } from "@chakra-ui/react"
import { FC } from "react"

const RootError: FC = () => {
  return (
    <Stack p={4} h={"100vh"} justifyContent={"center"} alignItems={"center"}>
      <Stack spacing={8} alignItems={"center"}>
        <Text>{"エラーが発生しました"}</Text>
      </Stack>
    </Stack>
  )
}

export default RootError
