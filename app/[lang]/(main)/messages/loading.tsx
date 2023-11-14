"use client"

import { Spinner, Stack } from "@chakra-ui/react"

const MessagesLoading = () => {
  return (
    <Stack
      p={4}
      w={"100%"}
      h={"50vh"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Spinner size={"xl"} color={"blue.500"} />
    </Stack>
  )
}

export default MessagesLoading
