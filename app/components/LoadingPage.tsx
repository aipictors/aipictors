"use client"
import { Spinner, Stack } from "@chakra-ui/react"

export const LoadingPage: React.FC = () => {
  return (
    <Stack
      p={4}
      h={"100vh"}
      justifyContent={"center"}
      alignItems={"center"}
      w={"100%"}
    >
      <Spinner size={"xl"} color={"blue.500"} />
    </Stack>
  )
}
