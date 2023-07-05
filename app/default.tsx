"use client"
import { Text, Stack } from "@chakra-ui/react"
import { FC } from "react"

const RootDefault: FC = () => {
  return (
    <Stack p={4} h={"100vh"} justifyContent={"center"} alignItems={"center"}>
      <Stack spacing={8} alignItems={"center"}>
        <Text>{"？"}</Text>
      </Stack>
    </Stack>
  )
}

export default RootDefault
