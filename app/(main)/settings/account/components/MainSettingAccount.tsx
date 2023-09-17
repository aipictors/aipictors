"use client"
import {
  HStack,
  Icon,
  IconButton,
  Input,
  Progress,
  Stack,
  Text,
} from "@chakra-ui/react"
import type { FC } from "react"
import { TbEye } from "react-icons/tb"

export const MainSettingAccount: FC = () => {
  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"アカウント"}
        </Text>
        <Stack>
          <Text>{"ログイン・ユーザID（英文字必須）"}</Text>
          <Text fontSize={12}>{"変更前：変更前ID"}</Text>
          <Input placeholder="ユーザID" />
        </Stack>
        <Stack>
          <Text>{"ログイン・パスワード"}</Text>
          <Text fontSize={12}>
            {"パスワード強度スコアが3以上（バーが黄色～緑色）"}
          </Text>
          <Text fontSize={12}>
            {"※ パスワード変更後は画面更新して再ログインしてください"}
          </Text>
          <HStack>
            <Input placeholder="新しいログインパスワード" />
            <IconButton
              aria-label="Search database"
              icon={<Icon as={TbEye} />}
            />
          </HStack>
          <Progress value={80} />
        </Stack>
      </Stack>
    </HStack>
  )
}
