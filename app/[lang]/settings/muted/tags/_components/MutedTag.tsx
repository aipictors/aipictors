"use client"

import { Box, Button, HStack, Text } from "@chakra-ui/react"
import React from "react"

type Props = {
  name: string
  onClick(): void
}

export const MutedTag: React.FC<Props> = (props) => {
  return (
    <HStack justifyContent={"space-between"}>
      <Box>
        <Text>{props.name}</Text>
      </Box>
      <Button borderRadius={"full"} onClick={props.onClick}>
        {"解除"}
      </Button>
    </HStack>
  )
}
