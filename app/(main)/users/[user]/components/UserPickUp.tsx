"use client"
import { HStack, Icon, IconButton, Stack, Text } from "@chakra-ui/react"
import { TbPlus } from "react-icons/tb"

export const UserPickUp: React.FC = () => {
  return (
    <Stack>
      <Text>{"Pick Up"}</Text>
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
