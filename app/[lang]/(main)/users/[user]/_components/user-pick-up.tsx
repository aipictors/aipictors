"use client"

import { HStack, Icon, IconButton, Stack, Switch, Text } from "@chakra-ui/react"
import { TbPlus } from "react-icons/tb"

export const UserPickUp = () => {
  return (
    <Stack>
      <Text>{"Pick Up"}</Text>
      <HStack>
        <Text>{"R18（n）"}</Text>
        <Switch />
      </HStack>
      <HStack justifyContent={"flex-start"}>
        <IconButton
          aria-label={"追加"}
          borderRadius={"full"}
          icon={<Icon as={TbPlus} />}
        />
      </HStack>
    </Stack>
  )
}
