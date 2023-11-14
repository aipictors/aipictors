"use client"

import { Stack, Text } from "@chakra-ui/react"

const RootError = () => {
  return (
    <Stack p={4} h={"100vh"} justifyContent={"center"} alignItems={"center"}>
      <Stack spacing={8} alignItems={"center"}>
        <Text>{"エラーが発生しました"}</Text>
      </Stack>
    </Stack>
  )
}

export default RootError
