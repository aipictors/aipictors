"use client"
import { Box, Button, HStack, Input, Stack, Text } from "@chakra-ui/react"
import { FC } from "react"

export const MainSettingMuteTags: FC = () => {
  return (
    <Box as={"main"} maxW={"sm"}>
      <Stack p={4}>
        <Text>{"ミュートしているタグ"}</Text>
        <HStack justifyContent={"center"}>
          <Input placeholder="タグ" size="sm" />
        </HStack>
        <HStack justifyContent={"flex-end"}>
          <Button colorScheme="primary" borderRadius={"full"}>
            {"変更を保存"}
          </Button>
          HStack
        </HStack>
      </Stack>
    </Box>
  )
}
