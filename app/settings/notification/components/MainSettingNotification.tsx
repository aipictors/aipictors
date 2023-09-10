"use client"
import { Box, Button, HStack, Stack, Switch, Text } from "@chakra-ui/react"
import { FC } from "react"

export const MainSettingNotification: FC = () => {
  return (
    <Box as={"main"} maxW={"sm"}>
      <Stack p={4}>
        <Text fontWeight={"bold"}>{"通知・いいね"}</Text>
        <Stack>
          <Text>{"匿名いいね"}</Text>
          <HStack justifyContent={"space-between"}>
            <Text>{"全年齢いいね"}</Text>
            <Switch />
          </HStack>
          <HStack justifyContent={"space-between"}>
            <Text>{"R-18いいね"}</Text>
            <Switch />
          </HStack>
        </Stack>
        <Stack>
          <Text>{"オフにすると次回以降の通知がされなくなります"}</Text>
          <HStack justifyContent={"space-between"}>
            <Text>{"定期いいね通知"}</Text>
            <Switch />
          </HStack>
          <HStack justifyContent={"space-between"}>
            <Text>{"リアルタイムいいね通知"}</Text>
            <Switch />
          </HStack>
          <HStack justifyContent={"space-between"}>
            <Text>{"コメント"}</Text>
            <Switch />
          </HStack>
        </Stack>
        <Button colorScheme="primary" borderRadius={"full"}>
          {"変更を保存"}
        </Button>
      </Stack>
    </Box>
  )
}
