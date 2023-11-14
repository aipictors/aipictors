"use client"

import { HStack, IconButton, Stack, Switch, Text } from "@chakra-ui/react"
import { Plus } from "lucide-react"

export const UserPickUp = () => {
  return (
    <Stack>
      <Text>{"Pick Up"}</Text>
      <HStack>
        <Text>{"R18（n）"}</Text>
        <Switch />
      </HStack>
      <HStack justifyContent={"flex-start"}>
        <IconButton aria-label={"追加"} borderRadius={"full"} icon={<Plus />} />
      </HStack>
    </Stack>
  )
}
