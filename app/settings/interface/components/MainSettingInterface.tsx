"use client"
import { Box, Button, HStack, Stack, Switch, Text } from "@chakra-ui/react"
import { FC } from "react"

export const MainSettingInterface: FC = () => {
  return (
    <Box as={"main"}>
      <Stack p={4} maxW={"sm"}>
        <Text fontWeight={"bold"}>{"UIカスタム"}</Text>
        <Stack>
          <HStack justifyContent={"space-between"}>
            <Text>{"サムネイルにいいねボタンを表示"}</Text>
            <Switch />
          </HStack>
          <HStack>
            <Text>{"ポップアップ（作品ダイアログ）を表示"}</Text>
            <Switch />
          </HStack>
        </Stack>
        <Stack>
          <HStack justifyContent={"center"}>
            <Button colorScheme="primary" borderRadius={"full"}>
              {"変更を保存"}
            </Button>
          </HStack>
        </Stack>
      </Stack>
    </Box>
  )
}
