"use client"
import { Spinner, Stack } from "@chakra-ui/react"
import type { FC } from "react"

const RootLoading: FC = () => {
  return (
    <Stack p={4} h={"100vh"} justifyContent={"center"} alignItems={"center"}>
      <Spinner size={"xl"} color={"blue.500"} />
    </Stack>
  )
}

export default RootLoading
