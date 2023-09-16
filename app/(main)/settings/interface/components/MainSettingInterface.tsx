"use client"
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react"
import { FC } from "react"

export const MainSettingInterface: FC = () => {
  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"UIカスタム"}
        </Text>
        <Stack>
          <FormControl display="flex" justifyContent={"space-between"}>
            <FormLabel mb={0}>{"サムネイルにいいねボタンを表示"}</FormLabel>
            <Switch />
          </FormControl>
          <FormControl display="flex" justifyContent={"space-between"}>
            <FormLabel mb={0}>
              {"ポップアップ（作品ダイアログ）を表示"}
            </FormLabel>
            <Switch />
          </FormControl>
        </Stack>
        <Stack>
          <HStack justifyContent={"center"}>
            <Button colorScheme="primary" borderRadius={"full"}>
              {"変更を保存"}
            </Button>
          </HStack>
        </Stack>
      </Stack>
    </HStack>
  )
}
