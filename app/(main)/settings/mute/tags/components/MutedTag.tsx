"use client"
import { Box, HStack, Icon, IconButton, Text } from "@chakra-ui/react"
import React from "react"
import { TbTrash } from "react-icons/tb"

type Props = {
  name: string
}

export const MutedTag: React.FC<Props> = (props) => {
  return (
    <HStack justifyContent={"space-between"}>
      <Box>
        <Text>{props.name}</Text>
      </Box>
      <IconButton
        aria-label="DeleteMuteTags"
        icon={<Icon as={TbTrash} />}
        variant={"ghost"}
        borderRadius={"full"}
      />
    </HStack>
  )
}
