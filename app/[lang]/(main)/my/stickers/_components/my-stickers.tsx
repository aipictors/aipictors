"use client"

import { Button, HStack, Stack, Text } from "@chakra-ui/react"
import { Plus } from "lucide-react"

export const MyStickers = () => {
  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"lg"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"作成済みスタンプ"}
        </Text>
        <HStack>
          <Button aria-label="add stickers" rightIcon={<Plus />} size={"lg"}>
            {"新しいスタンプ"}
          </Button>
        </HStack>
      </Stack>
    </HStack>
  )
}
