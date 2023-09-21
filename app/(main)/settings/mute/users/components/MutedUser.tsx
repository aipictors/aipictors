"use client"
import { Avatar, Box, HStack, Icon, IconButton, Text } from "@chakra-ui/react"
import React from "react"
import { TbTrash } from "react-icons/tb"

type Props = {
  name: string
  iconImageURL: string | null
}

export const MutedUser: React.FC<Props> = (props) => {
  return (
    <HStack justifyContent={"space-between"}>
      <HStack>
        <Avatar
          bg="teal.500"
          size={"sm"}
          src={props.iconImageURL ?? undefined}
        />
        <Box>
          <Text>{props.name}</Text>
        </Box>
      </HStack>
      <IconButton
        aria-label="DeleteMuteUsers"
        icon={<Icon as={TbTrash} />}
        variant={"ghost"}
        borderRadius={"full"}
      />
    </HStack>
  )
}
